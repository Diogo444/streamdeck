const express = require("express");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const PORT = 3721;

app.use(express.json());

const vscodeCandidates = [
  process.env.LOCALAPPDATA &&
    path.join(
      process.env.LOCALAPPDATA,
      "Programs",
      "Microsoft VS Code",
      "Code.exe"
    ),
  process.env.ProgramFiles &&
    path.join(process.env.ProgramFiles, "Microsoft VS Code", "Code.exe"),
  process.env["ProgramFiles(x86)"] &&
    path.join(
      process.env["ProgramFiles(x86)"],
      "Microsoft VS Code",
      "Code.exe"
    ),
].filter(Boolean);

const resolveVscodeCommand = () => {
  const existingPath = vscodeCandidates.find((candidate) =>
    fs.existsSync(candidate)
  );
  if (existingPath) {
    return `cmd /c start "" "${existingPath}"`;
  }
  return 'cmd /c start "" "code"';
};

const ACTIONS = {
  browser: {
    label: "Navigateur",
    command: 'cmd /c start "" "https://www.google.com"',
  },
  vscode: {
    label: "VS Code",
    command: resolveVscodeCommand,
  },
  youtube: {
    label: "YouTube",
    command: 'cmd /c start "" "https://www.youtube.com"',
  },
  discord: {
    label: "Discord",
    command: 'cmd /c start "" "discord://"',
  },
  chatgpt: {
    label: "ChatGPT",
    command: 'cmd /c start "" "https://chatgpt.com"',
  },
  gemini: {
    label: "Gemini",
    command: 'cmd /c start "" "https://gemini.google.com/app"',
  },
  googledrive: {
    label: "Google Drive",
    command: 'cmd /c start "" "https://drive.google.com"',
  },
  whatsapp: {
    label: "WhatsApp",
    command:
      'cmd /c start "" explorer.exe "shell:AppsFolder\\5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App"',
  },
};

const runCommand = (command) =>
  new Promise((resolve, reject) => {
    exec(command, { windowsHide: true }, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

// Sert les fichiers HTML/CSS/JS
app.use(express.static(path.join(__dirname, "public")));

// Route principale (optionnelle, mais claire)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/launch", async (req, res) => {
  const action = req.body?.action;
  const entry = ACTIONS[action];

  if (!entry) {
    res.status(400).json({ ok: false, error: "Action inconnue." });
    return;
  }

  const command =
    typeof entry.command === "function" ? entry.command() : entry.command;

  try {
    await runCommand(command);
    res.json({ ok: true, action, label: entry.label });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Echec du lancement." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
