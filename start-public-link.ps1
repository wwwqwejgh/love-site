param(
  [int]$Port = 4173
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$OutLog = Join-Path $Root "localtunnel.out.log"
$ErrLog = Join-Path $Root "localtunnel.err.log"

function Get-PythonPath {
  $known = "D:\anaconda3\python.exe"
  if (Test-Path $known) {
    return $known
  }

  $cmd = Get-Command python.exe -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }

  throw "没有找到 python.exe，请先安装 Python，或者把脚本里的 Python 路径改成你的实际路径。"
}

function Start-StaticServer {
  $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if ($listener) {
    return
  }

  $python = Get-PythonPath
  Start-Process `
    -FilePath $python `
    -ArgumentList @("-m", "http.server", "$Port", "--bind", "127.0.0.1") `
    -WorkingDirectory $Root `
    -WindowStyle Hidden

  Start-Sleep -Seconds 2
}

function Start-LocalTunnel {
  $npx = Get-Command npx.cmd -ErrorAction SilentlyContinue
  if (-not $npx) {
    throw "没有找到 npx.cmd。请先安装 Node.js，或改用 GitHub Pages / Vercel 部署。"
  }

  Remove-Item -LiteralPath $OutLog, $ErrLog -ErrorAction SilentlyContinue

  Start-Process `
    -FilePath $npx.Source `
    -ArgumentList @("--yes", "localtunnel", "--port", "$Port", "--local-host", "127.0.0.1") `
    -WorkingDirectory $Root `
    -RedirectStandardOutput $OutLog `
    -RedirectStandardError $ErrLog `
    -WindowStyle Hidden
}

function Wait-ForTunnelUrl {
  $deadline = (Get-Date).AddSeconds(60)
  do {
    Start-Sleep -Seconds 2
    $text = ""
    if (Test-Path $OutLog) {
      $text += Get-Content -Raw -LiteralPath $OutLog
    }
    if (Test-Path $ErrLog) {
      $text += "`n" + (Get-Content -Raw -LiteralPath $ErrLog)
    }

    if ($text -match "https://[^\s]+") {
      return $matches[0]
    }
  } while ((Get-Date) -lt $deadline)

  throw "没有拿到公网链接，请查看 localtunnel.out.log 和 localtunnel.err.log。"
}

function Get-TunnelPassword {
  try {
    return (Invoke-WebRequest -UseBasicParsing "https://loca.lt/mytunnelpassword" -TimeoutSec 20).Content.Trim()
  } catch {
    return "如果页面要求密码，请在电脑上访问 https://loca.lt/mytunnelpassword 查询。"
  }
}

Start-StaticServer
Start-LocalTunnel
$url = Wait-ForTunnelUrl
$password = Get-TunnelPassword

Write-Host ""
Write-Host "公网临时链接：$url" -ForegroundColor Green
Write-Host "手机首次访问如果要求 Tunnel Password，输入：$password" -ForegroundColor Yellow
Write-Host ""
Write-Host "保持这个窗口和电脑网络在线，链接才会持续可用。按 Ctrl+C 或关闭相关后台进程后，链接会失效。"
