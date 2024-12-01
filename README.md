# 直播串流平台

這是一個基於 Flask 的直播串流平台，包含會員申請、登入、基本直播功能、即時聊天室、送禮給直播主系統等功能。

## 環境需求

- Python 3.6 及以上版本
- pip（Python 的包管理工具）

## 本地執行步驟

### 1. 創建虛擬環境

在專案目錄中創建虛擬環境：
```bash
python -m venv venv
```

### 2. 啟動虛擬環境

根據不同的作業系統啟動虛擬環境:
- Windows
```bash
venv\Scripts\activate
```
- macOS/Linux
```bash
source venv/bin/activate
```

### 3. 安裝requirements.txt中的套件

```bash
pip install -r requirements.txt
```

### 4. 產生ssl簽證(需下載openssl)

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### 5. 啟動網頁

在專案目錄執行
```bash
python app.py
```

### 6. 前往網頁
在瀏覽器打上網址https://127.0.0.1:8443

## 使用Azure執行步驟

### 1. 創建虛擬機器(VM)

按照以下內容配置虛擬機:

- 虛擬機器名稱: popcat
- 安全性類型: 標準
- 影像: Ubuntu Server 24.04 LTS - x64 第二代
- 大小: Standard_D2s_v3 - 2個vcpu，8 GiB 記憶體
- 驗證類型: 密碼
- 使用者名稱: popcat
- 密碼: @Stream87878
- 選取輸入連接埠: HTTP, HTTPS, SSH
- OS 磁碟類型: 標準 HDD

### 2. 網路設定

前往虛擬機>網路>網路設定後:
#### 1. HTTPS優先順序設定為290
#### 2. 建立連接埠規則>輸入連接埠規則，將"目的地連接埠範圍"改成8443

### 3. 本地連接虛擬機

在本地開啟cmd並輸入:
```bash
ssh popcat@<vm public ip>
```

成功連上後輸入:
```bash
git clone https://github.com/flyflyk/PopCatStream.git
cd PopCatStream
chmod +x setup_env.sh
./setup_env.sh
```
### 4. 修改nginx配置

把setup_env.sh中nginx的配置複製貼上:
```bash
sudo nano /etc/nginx/sites-available/popcatstream
sudo nginx -t
sudo systemctl restart nginx
```

### 5. 修改live_stream.js

```bash
sudo nano /home/popcat/PopCatStream/app/static/js/live_stream.js
```
live_stream的第一行:const socket = io.connect('https://<VM public IP>:8443');

### 6. 啟動網頁

啟動flask應用:
```bash
source venv/bin/activate
python app.py
```
開啟另一個cmd並連上虛擬機後:
```bash
cd PopCatStream
node server.js
```
