import React, { useState, useEffect, useRef } from 'react'
import { Box, Text, useApp } from 'ink'
import Spinner from 'ink-spinner'
import { execSync } from 'child_process'
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { randomBytes } from 'crypto'

// ── Types ──────────────────────────────────────────────────────────────────────

type Phase = 'folders' | 'obsidian-check' | 'done'
type Status = 'idle' | 'running' | 'done' | 'skipped' | 'error'
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

function obsidianConfigPath(): string | null {
  if (process.platform === 'darwin')
    return `${homedir()}/Library/Application Support/obsidian/obsidian.json`
  if (process.platform === 'linux')
    return `${homedir()}/.config/obsidian/obsidian.json`
  return null
}

function registerVault(vaultPath: string): void {
  const configPath = obsidianConfigPath()
  if (!configPath || !existsSync(configPath)) return
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf8'))
    if (!config.vaults) config.vaults = {}
    const alreadyRegistered = Object.values(config.vaults).some((v: any) => v.path === vaultPath)
    if (alreadyRegistered) return
    const id = randomBytes(8).toString('hex')
    config.vaults[id] = { path: vaultPath, ts: Date.now(), open: true }
    writeFileSync(configPath, JSON.stringify(config))
  } catch {}
}

function openObsidian(vaultPath: string): void {
  try {
    registerVault(vaultPath)
    const uri = `obsidian://open?path=${encodeURIComponent(vaultPath)}`
    if (process.platform === 'darwin') execSync(`open "${uri}"`, { stdio: 'pipe' })
    else if (process.platform === 'linux') execSync(`xdg-open "${uri}"`, { stdio: 'pipe' })
  } catch {}
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
      case 'skipped': return <Text dimColor>–</Text>
      case 'error':   return <Text color="red">✗</Text>
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

// ── App ────────────────────────────────────────────────────────────────────────

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

  // Phase 2 — check for Obsidian; open if found, skip silently if not
  useEffect(() => {
    if (phase !== 'obsidian-check') return
    if (checkObsidian()) {
      openObsidian(rootDir)
      setObsSt('done')
      setObsNote('opened')
    } else {
      setObsSt('skipped')
    }
    setPhase('done')
  }, [phase])

  // Exit once done
  useEffect(() => {
    if (phase !== 'done') return
    const t = setTimeout(exit, 120)
    return () => clearTimeout(t)
  }, [phase, exit])

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>

      <Logo />
      <Text dimColor>  your AI workspace, installed</Text>

      <Box marginY={1}><Divider /></Box>

      <Box flexDirection="column" gap={0}>
        <Step label="Create vault structure" status={folderStatus} />
        <Step label="Open Obsidian"          status={obsStatus} note={obsNote} />
      </Box>

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
              <Box marginTop={1} flexDirection="column">
                <Text dimColor>Next steps:</Text>
                <Box gap={1} marginLeft={1}>
                  <Text color="cyan">1.</Text>
                  <Text dimColor>Point your AI agent (Claude Code, Cursor…) at the workspace dir</Text>
                </Box>
                <Box gap={1} marginLeft={1}>
                  <Text color="cyan">2.</Text>
                  <Text dimColor>Start capturing in <Text color="white">00_INBOX/</Text></Text>
                </Box>
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
