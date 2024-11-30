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
```bash
...
```
### 2. 網路設定

前往虛擬機>網路>網路設定後:
#### 1. HTTPS優先順序設定為290
#### 2. 建立連接埠規則>輸入連接埠規則:
    目的地連接埠範圍改成8443

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

