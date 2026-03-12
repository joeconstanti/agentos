import React, {useState} from 'react';
import {render, Box, Text, Newline, useInput, useApp} from 'ink';
import process from 'node:process';
import {spawn} from 'node:child_process';

const openUrlInBrowser = url => {
	const platform = process.platform;

	if (platform === 'darwin') {
		spawn('open', [url], {stdio: 'ignore', detached: true}).unref();
	} else if (platform === 'win32') {
		spawn('cmd', ['/c', 'start', '', url], {
			stdio: 'ignore',
			detached: true
		}).unref();
	} else {
		spawn('xdg-open', [url], {stdio: 'ignore', detached: true}).unref();
	}
};

const STEP_WELCOME = 0;
const STEP_OBSIDIAN = 1;
const STEP_AGENT = 2;
const STEP_DONE = 3;

const App = () => {
	const [step, setStep] = useState(STEP_WELCOME);
	const {exit} = useApp();

	useInput((input, key) => {
		if (input === 'q' || (key.ctrl && input === 'c')) {
			exit();
			return;
		}

		if (key.return) {
			if (step === STEP_DONE) {
				exit();
				return;
			}

			setStep(previous => Math.min(previous + 1, STEP_DONE));
			return;
		}

		if (step === STEP_OBSIDIAN && (input === 'o' || input === 'O')) {
			openUrlInBrowser('https://obsidian.md/download');
		}
	});

	const nodeVersion = process.version;
	const cwd = process.cwd();

	return (
		<Box
			flexDirection="column"
			padding={1}
			borderStyle="round"
			borderColor="cyan"
		>
			<Text color="magentaBright" bold>
				AgentOS Installer
			</Text>
			<Text dimColor>Beautiful setup powered by Ink + React</Text>
			<Newline />

			{step === STEP_WELCOME && (
				<>
					<Text>
						Welcome to <Text bold>AgentOS</Text> — your personal vault +
						agent workspace.
					</Text>
					<Newline />
					<Text color="cyan">Environment</Text>
					<Text dimColor>
						- Node.js: {nodeVersion}
						{'\n'}- Workspace: {cwd}
					</Text>
					<Newline />
					<Text>
						Press <Text bold>Enter</Text> to set up Obsidian, or{' '}
						<Text bold>q</Text> to quit.
					</Text>
				</>
			)}

			{step === STEP_OBSIDIAN && (
				<>
					<Text color="cyan" bold>
						Step 1 — Install & open Obsidian
					</Text>
					<Newline />
					<Text>
						1. If you do not have Obsidian yet, download it from:
					</Text>
					<Text dimColor>   https://obsidian.md/download</Text>
					<Text>
						2. On macOS, a browser can be opened for you by pressing{' '}
						<Text bold>o</Text>.
					</Text>
					<Text>
						3. Once Obsidian is installed, open it and choose{' '}
						<Text italic>"Open folder as vault"</Text>.
					</Text>
					<Text>
						4. Select this folder:{' '}
						<Text dimColor>{cwd}</Text>
					</Text>
					<Newline />
					<Text>
						When you are ready, press <Text bold>Enter</Text> to continue
						to agent setup, or <Text bold>q</Text> to quit.
					</Text>
				</>
			)}

			{step === STEP_AGENT && (
				<>
					<Text color="cyan" bold>
						Step 2 — Connect your AI agent
					</Text>
					<Newline />
					<Text>
						This repo is your shared workspace for agents and Obsidian.
					</Text>
					<Newline />
					<Text>Recommended next actions:</Text>
					<Text dimColor>
						- In your preferred AI coding tool (Cursor, Claude Code, etc.),
						conf{'\n'}
						  igure the workspace root to this folder so the agent can read\n
						  and write notes, specs, and scripts here.
					</Text>
					<Text dimColor>
						- Explore the structure: `notes/`, `specs/`, `agents/`,
						`playbooks/`, `scripts/`, `archive/`.
					</Text>
					<Newline />
					<Text>
						Press <Text bold>Enter</Text> for a quick summary, or{' '}
						<Text bold>q</Text> to quit.
					</Text>
				</>
			)}

			{step === STEP_DONE && (
				<>
					<Text color="greenBright" bold>
						You are all set! ✅
					</Text>
					<Newline />
					<Text>
						- Obsidian: open this repo as a vault to navigate and edit your
						knowledge.
					</Text>
					<Text>
						- Agent: point your AI agent at this directory to give it full
						context.
					</Text>
					<Text>
						- Next: start capturing notes in `notes/` and specs in `specs/`.
					</Text>
					<Newline />
					<Text>
						Press <Text bold>Enter</Text> or <Text bold>q</Text> to exit.
					</Text>
				</>
			)}
		</Box>
	);
};

render(<App />);

