import React, { useState, useEffect, useRef } from 'react'
import { Box, Text, useApp, useInput } from 'ink'
import Spinner from 'ink-spinner'
import { execSync, spawn } from 'child_process'
import { mkdirSync, existsSync } from 'fs'
import { homedir } from 'os'

// ── Types ──────────────────────────────────────────────────────────────────────

type Phase = 'folders' | 'obsidian-check' | 'obsidian-prompt' | 'obsidian-install' | 'done'
type Status = 'idle' | 'running' | 'done' | 'skipped' | 'error'
interface SelectItem { label: string; value: string }
interface Props { rootDir: string }

// ── Utilities ──────────────────────────────────────────────────────────────────

const VAULT_DIRS = ['00_INBOX', '01_PROJECTS', '02_AREAS', '03_RESOURCES', '04_ARCHIVE']

function checkObsidian(): boolean {
  try { execSync('which obsidian', { stdio: 'pipe' }); return true } catch {}
  if (process.platform === 'darwin') {
    if (existsSync('/Applications/Obsidian.app')) return true
    if (existsSync(`${homedir()}/Applications/Obsidian.app`)) return true
  }
  if (process.platform === 'linux') {
    if (existsSync('/opt/Obsidian/obsidian')) return true
    if (existsSync(`${homedir()}/.local/share/applications/obsidian.desktop`)) return true
  }
  return false
}

function openObsidian(dir: string): void {
  try {
    const uri = `obsidian://open?path=${encodeURIComponent(dir)}`
    if (process.platform === 'darwin') execSync(`open "${uri}"`, { stdio: 'pipe' })
    else if (process.platform === 'linux') execSync(`xdg-open "${uri}"`, { stdio: 'pipe' })
  } catch {}
}

function openUrl(url: string): void {
  try {
    if (process.platform === 'darwin') execSync(`open "${url}"`, { stdio: 'pipe' })
    else if (process.platform === 'linux') execSync(`xdg-open "${url}"`, { stdio: 'pipe' })
  } catch {}
}

function installViaHomebrew(): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('brew', ['install', '--cask', 'obsidian'], { stdio: 'pipe' })
    proc.on('close', code => code === 0 ? resolve() : reject(new Error(`brew exited ${code}`)))
    proc.on('error', reject)
  })
}

// ── Components ─────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Box flexDirection="column">
      <Text color="cyanBright" bold>{` █████╗  ██████╗ ███████╗███╗   ██╗████████╗ ██████╗ ███████╗`}</Text>
      <Text color="cyanBright" bold>{`██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██╔═══██╗██╔════╝`}</Text>
      <Text color="cyanBright" bold>{`███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██║   ██║███████╗`}</Text>
      <Text color="cyanBright" bold>{`██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██║   ██║╚════██║`}</Text>
      <Text color="cyanBright" bold>{`██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ╚██████╔╝███████║`}</Text>
      <Text color="cyanBright" bold>{`╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚══════╝`}</Text>
    </Box>
  )
}

function Divider() {
  return <Text dimColor>{'─'.repeat(64)}</Text>
}

function Step({ label, status, note }: { label: string; status: Status; note?: string }) {
  const icon = (() => {
    switch (status) {
      case 'running': return <Text color="cyan"><Spinner type="dots" /></Text>
      case 'done':    return <Text color="green">✓</Text>
      case 'error':   return <Text color="red">✗</Text>
      case 'skipped': return <Text dimColor>–</Text>
      default:        return <Text> </Text>
    }
  })()

  return (
    <Box gap={2}>
      <Box width={2}>{icon}</Box>
      <Text color={status === 'idle' ? 'gray' : 'white'}>{label}</Text>
      {note && <Text dimColor>{note}</Text>}
    </Box>
  )
}

function SelectMenu({ items, onSelect }: { items: SelectItem[]; onSelect: (v: string) => void }) {
  const [cursor, setCursor] = useState(0)

  useInput((_, key) => {
    if (key.upArrow)   setCursor(c => Math.max(0, c - 1))
    if (key.downArrow) setCursor(c => Math.min(items.length - 1, c + 1))
    if (key.return)    onSelect(items[cursor].value)
  })

  return (
    <Box flexDirection="column">
      {items.map((item, i) => (
        <Box key={item.value} gap={1}>
          <Text color={i === cursor ? 'cyanBright' : 'gray'}>{i === cursor ? '❯' : ' '}</Text>
          <Text color={i === cursor ? 'white' : 'gray'} bold={i === cursor}>{item.label}</Text>
        </Box>
      ))}
    </Box>
  )
}

// ── App ────────────────────────────────────────────────────────────────────────

const OBSIDIAN_MENU: SelectItem[] = [
  { label: 'Install via Homebrew', value: 'brew'     },
  { label: 'Open download page',   value: 'download' },
  { label: 'Skip for now',         value: 'skip'     },
]

export default function App({ rootDir }: Props) {
  const { exit } = useApp()

  const [phase,        setPhase]    = useState<Phase>('folders')
  const [folderStatus, setFolderSt] = useState<Status>('running')
  const [obsStatus,    setObsSt]    = useState<Status>('idle')
  const [obsNote,      setObsNote]  = useState('')
  const [errorMsg,     setErrorMsg] = useState('')
  const ran = useRef(false)

  // Phase 1 — create vault structure
  useEffect(() => {
    if (ran.current) return
    ran.current = true
    try {
      VAULT_DIRS.forEach(d => mkdirSync(`${rootDir}/${d}`, { recursive: true }))
      setFolderSt('done')
    } catch (e: any) {
      setFolderSt('error')
      setErrorMsg(e.message)
    }
    setObsSt('running')
    setPhase('obsidian-check')
  }, [])

  // Phase 2 — check for Obsidian
  useEffect(() => {
    if (phase !== 'obsidian-check') return
    const found = checkObsidian()
    if (found) {
      openObsidian(rootDir)
      setObsSt('done')
      setObsNote('opened')
      setPhase('done')
    } else {
      setObsSt('idle')
      setPhase('obsidian-prompt')
    }
  }, [phase])

  // Phase 3b — Homebrew install (non-blocking so spinner animates)
  useEffect(() => {
    if (phase !== 'obsidian-install') return
    installViaHomebrew()
      .then(() => {
        openObsidian(rootDir)
        setObsSt('done')
        setObsNote('installed')
        setPhase('done')
      })
      .catch((e: Error) => {
        setObsSt('error')
        setObsNote(e.message)
        setPhase('done')
      })
  }, [phase])

  // Exit once done
  useEffect(() => {
    if (phase !== 'done') return
    const t = setTimeout(exit, 120)
    return () => clearTimeout(t)
  }, [phase, exit])

  const handleObsidianSelect = (value: string) => {
    if (value === 'brew') {
      setObsSt('running')
      setObsNote('this may take a minute...')
      setPhase('obsidian-install')
    } else if (value === 'download') {
      openUrl('https://obsidian.md/download')
      setObsSt('skipped')
      setObsNote('download page opened')
      setPhase('done')
    } else {
      setObsSt('skipped')
      setPhase('done')
    }
  }

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>

      <Logo />
      <Text dimColor>  your AI workspace, installed</Text>

      <Box marginY={1}><Divider /></Box>

      <Box flexDirection="column" gap={0}>
        <Step label="Create vault structure" status={folderStatus} />
        <Step label="Set up Obsidian"        status={obsStatus} note={obsNote} />
      </Box>

      {phase === 'obsidian-prompt' && (
        <Box flexDirection="column" marginTop={1} paddingLeft={4}>
          <Text color="yellow">Obsidian not found — how would you like to proceed?</Text>
          <Box marginTop={1}>
            <SelectMenu items={OBSIDIAN_MENU} onSelect={handleObsidianSelect} />
          </Box>
        </Box>
      )}

      {phase === 'done' && (
        <Box flexDirection="column" marginTop={1}>
          <Divider />
          <Box flexDirection="column" marginTop={1} paddingLeft={2}>
            <Text color="greenBright" bold>All done!</Text>
            <Box marginTop={1} flexDirection="column">
              <Box gap={2}>
                <Text dimColor>Workspace</Text>
                <Text color="white">{rootDir}</Text>
              </Box>
              <Box gap={2}>
                <Text dimColor>Next     </Text>
                <Text dimColor>drop notes into <Text color="white">00_INBOX/</Text> · point your agent at this dir</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {errorMsg && (
        <Box marginTop={1}>
          <Text color="red">  Error: {errorMsg}</Text>
        </Box>
      )}

    </Box>
  )
}
