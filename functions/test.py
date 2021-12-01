
from telethon import TelegramClient

# Remember to use your own values from my.telegram.org!
api_id = 14367775
api_hash = '86c2b7287a41f08329a15f7b15188df6'
phone = '+14384934321'
client = TelegramClient('anon', api_id, api_hash)

async def main():
    await client.connect()
    if not await client.is_user_authorized():
        await client.send_code_request(phone)
        me =await client.sign_in(phone, input('Enter code: '))
        print(me.stringify())
        #await client.sign_in(phone, cod)

with client:
    client.loop.run_until_complete(main())