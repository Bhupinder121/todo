from bs4 import BeautifulSoup
import requests
import mysql.connector

html_text = requests.get('https://www.briantracy.com/blog/personal-success/26-motivational-quotes-for-success/').text
soup = BeautifulSoup(html_text,'html.parser')
rawQuotes = soup.find('div',class_ ='mainbar').find_all('h3')

quotes = []

for quote in rawQuotes:
    if(quote.text!="Share Your Favorite Motivational Quotes in the Comments Below"):
        num =""
        count = 0
        quote_text = quote.text.replace(")","")
        for text in quote_text:
            if(text.isdigit()):
                count +=1 
                if(count==3):
                    break
                num += text

        quote_text = quote_text.replace(num,"")
        quote_text = quote_text.replace(u'\u201c', '').replace(u'\u201d', '')
        quote_text = quote_text.replace(" ",'',1)
        quotes.append(quote_text)
        

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

