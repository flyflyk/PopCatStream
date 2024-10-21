sudo apt install apache2 
sudo systemctl start apache2 
sudo systemctl status apache2 
sudo apt update 
sudo apt install python3 python3-pip 
git clone https://github.com/flyflyk/PopCatStream.git 
cd PopCatStream/ 
pip install -r requirements.txt 
python app.py 