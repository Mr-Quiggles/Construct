[My Construct bot](https://ygo.apoq.li/)

##Installation and usage
The entire bot requires [Node.js](https://nodejs.org/en/download/) to run. A list of required modules to install are under `/node_modules/required.md`.

##Configuring

Under `/data/bots.json` is a list of bots available for use. You can connect to Discord via email+password or a OAUTH token supplied through [here](https://discordapp.com/developers/docs/topics/oauth2). Each entry's key is a Discord ID. You can leave this blank I think.

`name:` cosmetic, used for log output

`server.enabled:` boolean to enable the HTTP server backend for API calls. The bot *should* function without it enabled, as it makes it's API calls internally rather than back out through HTTP

`server.hostname:` cosmetic, used for `.help` on the Discord side, and for logging

`server.port:` port for the HTTP server to listen to

`enabled:` whether to run this bot through `master.js`

**Discord Configuration** *(you can ignore this if you're just for the API server)*

`email:` `password:` email and password to use to connect to Discord

`token:` OAUTH token to connect to Discord.

`permissions:` permission table for the Discord side of the bot

`permissions.priority:` either falls back to `user` or `server` permissions in the event of a conflict. In most cases, fallback to `user` is preffered

`permissions.*.mode:` either `blacklist` or `whitelist`. Self-explanatory

`permissions.*.matches: ` contain regex strings; if the message matches any of these in the block: if the block's mode is `blacklist`, then the message is ignored; or if the block's mode is `whitelist`, then only messages that matches the regex is parsed.

###Documentation

**Landing Page** `/` or `/help`

Both the main page and `/help` land you to a page containing a """console""" (type in commands, and the results are pasted into the top box), and a box with a list of ""commands"" (they're just API calls; paste any in front of `ygo.apoq.li` to run it). It also doubles as a help page for the Discord side of Construct, but for these purposes, its irrelevant.

Within the list of commands, are a usage guide, and a summary on what the command does. Parameters that are required are surrounded with curly brackets (`{name}`), while optional parameters are surrounded with parentheses (`(name)`).

**Yugioh Card Lookup** `/ygo?name={card}` __Example__: [https://ygo.apoq.li/ygo?name=Pot of Memes](https://ygo.apoq.li/ygo?name=Pot+of+Memes)
The bread and butter of Construct. This command does some dark magic to get the first result from the Yugioh wikia, and *hopefully* it's an actual card. If I had an always up to date card database (like ygopro's `cards.cdb`), then I wouldn't need to do a meticulous search, and instead can do a MySQL query (like I do with `.ydk`). I might be able to with DevPro since Percy's beta-cards aren't actually stored back into `cards.cdb`. Oh well.

It pretty much JSONifies a card page, making it nice and neat to use for other commands.

**Summon** `/summon(?html)`

In another Discord server, one channel was dedicated to returning a *minion meme* whenever someone talked into it. I expanded it to giving a *bazinga meme* for another channel. Finally, I wanted to make it actually Yugioh related, so it gave a random Yugioh card. It's nice to find that random spicy tech for the next regionals within a few days to counter `[insert tier 1 deck]` and then never touch the tech again.

`?html` just embeds the HQ card image stored on my server. Sometimes it's there, but other times, if it's a new card, is the disgusting (anti-)Anteatereatingant sized thumbnail.

**Ygopro Deck Printer** `/ydk?url={URL}&format=(compact|expanded)` __Example__: [https://ygo.apoq.li/ydk?url=https://apoq.li/uf/sh/access/?h=0e9499b50e5939116c3e697fc2369dba](https://ygo.apoq.li/ydk?url=https://apoq.li/uf/sh/access/?h=0e9499b50e5939116c3e697fc2369dba)

The plate and butter knife of Construct. Usually when my friends share a deck, it's some disgusting screencap of ygopro with the default (anti-)Anteatereatingant-sized thumbnails. Yuck! While I usually can tell what a card is by it's art, the thumbnail size makes it harder to discern. Well, now with this command, it'll make a readable list out of your `.ydk`s for ease of sharing! Sadly, I still need to stop being lazy and make it retain the card order from the `.ydk`. That'll involve writing my own `JSON.stringify` I guess, but it'll be worth it.

`compact` is the default option, and just gives a name and a card count.

`expanded` is used for the jam of Construct, which I'll get to later. It just provides extra properties for other uses.

**Yugioh Price lookup** `/ygoprices?name={name}` __Example__:
[https://ygo.apoq.li/ygoprices?name=Pot of Memes](https://ygo.apoq.li/ygoprices?name=Pot+of+Memes)

I didn't like how Yugiohprice's API was for card lookup. It requires an ***exact*** name for price lookup, and the mess of giving price data. Really, why are there multiple statuses I need to check? Why list `C-Crush Wyvern` when it's price data is unavailable? No shit it's unavailable.

Anyways, like `.ygo`, it'll query the Yugioh wiki for the full card name, then use it to query Yugiohprice's API to provide card pricing data. Naturally, their API is sorted from cheapest to most expensive, beneficial for later uses. Each result is stored by set name, and within each object is the card name, rarity, minimum pricing, maximum pricing, and their adjusted average. Does it's job, but still has it's problems with how minimum is used.


#Last but certainly not least

**Yugioh Deck Pricing** `/ydkprice?url={URL}&use=(min|max|average)&mode=(ydk|json|guess)&booji` __Example__: [https://ygo.apoq.li/ydkprice?url=https://apoq.li/uf/sh/access/?h=0e9499b50e5939116c3e697fc2369dba&booji](https://ygo.apoq.li/ydkprice?url=https://apoq.li/uf/sh/access/?h=0e9499b50e5939116c3e697fc2369dba&booji)

What a feature packed URI string! This is the kitchen to Construct. Soon, I might sell a bunch of my decks that I'm not using (Yang Zincs got too hyped, but I got sick of them because they're a one-trick pony), and instead of having pen(cil) and paper to calculate it's value, why not have Construct do it for me? What a lovely wife.

Sadly, because of how ydk's are stored, ygopro doesn't give a damn about card rarity. However, I tried to alleviate this with the `expanded` URI flag for `/ygo`. The JSON outputted gives a field for the card's set, perfect for pricing data! However, this has to **be manually** edited. On the plus side, it's easy to assume lowest-rarity pricing, because of how Yugiohprice's API returns results (remember, the cheapest set is first).

`use=(min|max|average)` accounts for, obviously, the minimum, maximum, or average price for a card. It defaults to average (since a lot of people at locals use average pricing, makes sense though when you see the actual listings).

`mode=(ydk|json|guess)` tells Construct to either parse it as a `ydk` file or `JSON` string from the get-go. It defaults to `guess` though, which means it tries to parse it as a JSON string, then falls back to parsing it as a `ydk` file. It'll run it though the `/ydk` API call.

`booji` is a boolean that uses the most expensive set for a card instead of the lowest pricing. Nice if you want to budget for max rarity from the get go. Obviously, it's set to false if excluded.
