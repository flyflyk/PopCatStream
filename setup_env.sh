# 安裝包
sudo apt update && sudo apt upgrade -y
sudo apt install python3 python3-pip python3-venv python-is-python3 -y
sudo apt install nginx -y
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# ssl憑證
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
  -subj "/C=TW/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"

# python 虛擬環境
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt 

# 配置 Nginx
sudo bash -c "cat > /etc/nginx/sites-available/popcatstream <<EOF

EOF"


# 啟用 Nginx 配置
sudo ln -s /etc/nginx/sites-available/popcatstream /etc/nginx/sites-enabled/
sudo nginx -t  # 測試 Nginx 
sudo systemctl restart nginx  # 重啟 Nginx

# 允許防火牆
sudo ufw allow 80,443,8443,8444/tcp

# npm 配置
sudo npm install express socket.io socket.io-client pm2

echo "部署完成！可以執行 'source venv/bin/activate && python app.py' 來啟動應用。"
