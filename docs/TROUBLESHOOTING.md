# Troubleshooting

## ENOSPC: System Limit For File Watchers Reached

Next.js uses file watchers during development. On Linux, the default inotify watcher limit can be too low when several projects or editors are open.

Immediate workaround:

```bash
npm run dev:poll
```

Permanent Linux fix:

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
echo fs.inotify.max_user_instances=1024 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

Then restart the dev server:

```bash
npm run dev
```

You can also reduce watcher usage by closing unused VS Code windows, stopping old dev servers, and deleting stale `.next` folders in projects you are not running.
