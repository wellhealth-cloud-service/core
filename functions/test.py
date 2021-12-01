from telethon import TelegramClient

# Remember to use your own values from my.telegram.org!
api_id = *
api_hash = '*'
phone = '*'
client = TelegramClient('anon', api_id, api_hash)

async def main():
    await client.connect()
    if not await client.is_user_authorized():
        await client.send_code_request(phone)
        me =await client.sign_in(phone, input('Enter code: '))
    
    # Getting information about yourself
    me = await client.get_me()
    #print(me.stringify())
        #await client.sign_in(phone, cod)
    # You can send messages to yourself...
    for x in range(1000):
        await client.send_message('wellhealthbot', '/analysis')

with client:
    client.loop.run_until_complete(main())