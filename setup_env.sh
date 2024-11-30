# 安裝包
sudo apt update && sudo apt upgrade -y
sudo apt install python3 python3-pip python3-venv python-is-python3 -y
sudo apt install nginx -y

# ssl憑證
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
  -subj "/C=TW/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"

# python 虛擬環境
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt 

# 配置 Nginx
sudo bash -c "cat > /etc/nginx/sites-available/popcatstream <<EOF
server {
    listen 80;
    server_name _;

    # 將所有 HTTP 請求重定向到 HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name _;

    # 指定 SSL 憑證和私鑰
    ssl_certificate /home/popcat/PopCatStream/cert.pem;
    ssl_certificate_key /home/popcat/PopCatStream/key.pem;

    location / {
        # 代理請求到 Flask 應用
        proxy_pass https://127.0.0.1:8443;

        # 設置正確的 HTTP 標頭以便代理
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF"


# 啟用 Nginx 配置
sudo ln -s /etc/nginx/sites-available/popcatstream /etc/nginx/sites-enabled/
sudo nginx -t  # 測試 Nginx 
sudo systemctl restart nginx  # 重啟 Nginx

sudo ufw allow 80,443/tcp 

echo "部署完成！可以執行 'python app.py' 來啟動應用。"
