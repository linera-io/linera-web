<div align="center">
  <img src="extension/public/assets/linera/Linera_FullColor_H.svg" width="250">
</div>

# **Linera Web Client**  

This repository implements a **Web client** for the **Linera protocol**.

<div align="center">

[![GitHub Repo stars](https://img.shields.io/github/stars/linera-io/linera-web?logo=github&color=yellow)](https://github.com/linera-io/linera-web/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/linera-io/linera-web?logo=github&color=blue)](https://github.com/linera-io/linera-web/network/members)
[![GitHub last commit](https://img.shields.io/github/last-commit/linera-io/linera-web?logo=git)](https://github.com/linera-io/linera-web/commits/main)
[![License](https://img.shields.io/badge/license-Apache-green.svg)](LICENSE)[![Website](https://img.shields.io/badge/Website-Linera.io-blue?style=flat&logo=google-chrome)](https://linera.io)
[![Telegram](https://img.shields.io/badge/Telegram-26A5E4?logo=telegram&logoColor=white)](https://t.me/linera_io)
[![Discord](https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white)](https://discord.gg/linera)
[![Twitter](https://img.shields.io/twitter/follow/linera_io?style=social)](https://x.com/linera_io)


</div>

---

## **Setup**  

This repository includes a **Nix flake** that precisely specifies its build environment.  
To set up, install **Nix** with flake support (e.g., via the [Determinate Nix Installer](https://github.com/DeterminateSystems/nix-installer))  
and then run:

**Enter the build environment**  

```bash
nix develop
```

Currently, **only Linux (`x86_64-unknown-linux-gnu`)** is supported.

---

## **Building the Project**  

Linera Web Client builds with **pnpm**.

**1. Install JavaScript dependencies:**

```bash
pnpm install
```

**2. Build the extension:**  

```bash 
cd extension && pnpm build:extension
 ```

This will generate an **unpacked Manifest v3 extension** in `extension/dist/extension`.

---

## **Installation**  

After successfully building the extension, you can load it into **Chrome/Chromium**:  

1. Open the **settings menu**.  
2. Navigate to **Extensions** → **Manage Extensions**.  
3. Enable **Developer mode** (this will show an option **Load unpacked**).  
4. Select the `extension/dist` directory.  
5. **Done! The extension is installed!**  

To make access easier, **pin the extension** to appear in the top-level toolbar.

---

## **Development Mode**  

For development, use the **watch mode** to automatically rebuild on changes:  

```bash 
pnpm build --watch
```

Changes to the **client worker** won’t be reflected until you manually run:  

```bash 
wasm-pack build
```

---

## **Join the Community**  

<p align="left">
  <a href="https://t.me/linera_io">
    <img src="https://img.shields.io/badge/Telegram-26A5E4?logo=telegram&logoColor=white&style=for-the-badge" alt="Telegram">
  </a>
  <a href="https://discord.gg/linera">
    <img src="https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white&style=for-the-badge" alt="Discord">
  </a>
  <a href="https://x.com/linera_io">
    <img src="https://img.shields.io/badge/Twitter-000000?logo=x&logoColor=white&style=for-the-badge" alt="Twitter (X)">
  </a>

  <a href="https://linera.io">
    <img src="https://img.shields.io/badge/Website-0077b5?logo=internet-explorer&logoColor=white&style=for-the-badge" alt="Official Website">
  </a>
  <a href="https://linera.dev">
    <img src="https://img.shields.io/badge/Developer%20Docs-4CAF50?logo=read-the-docs&logoColor=white&style=for-the-badge" alt="Developer Docs">
  </a>
  <a href="https://linera.io/whitepaper">
    <img src="https://img.shields.io/badge/Whitepaper-FFA500?logo=bookstack&logoColor=white&style=for-the-badge" alt="Whitepaper">
  </a>
</p>

