from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import mysql.connector
import time


options = Options()
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36 OPR/71.0.3770.310"


options.headless = True
options.add_argument(f'user-agent={user_agent}')
options.add_argument("--window-size=1920,1080")
options.add_argument('--ignore-certificate-errors')
options.add_argument('--allow-running-insecure-content')
options.add_argument("--disable-extensions")
options.add_argument("--proxy-server='direct://'")
options.add_argument("--proxy-bypass-list=*")
options.add_argument("--start-maximized")
options.add_argument('--disable-gpu')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--no-sandbox')

DRIVER_PATH = ""
driver = webdriver.Chrome(options=options, executable_path=DRIVER_PATH)
driver.get('https://parade.com/937586/parade/life-quotes/')

soup = BeautifulSoup(driver.page_source,'html.parser')
rawData = soup.find_all('p')
quotes = []
for i in range(0, len(rawData)):
    data = rawData[i].text
    quoteData = data.split(".", 1)
    if(quoteData[0].isdigit()):
        quote = quoteData[1].replace("“", "").replace("”", "")
        quotes.append(quote)


# mydb = mysql.connector.connect(
#   host="localhost",
#   user="root",
#   password="Bhupinder@1234",
#   database="test"
# )
# mycursor = mydb.cursor()
# for quote in quotes:
#     sql = "INSERT INTO quotes_table (quoteName, isSend) VALUES (%s, %s)"
#     val = (quote, False)
#     mycursor.execute(sql, val)
#     mydb.commit()