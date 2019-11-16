# XBOX

See your friends, look what if they are online, see what they are playing and get notified. Also turn on your Xbox One using this app

## Friend

Add a XBOX friend as device, we will poll every 10 minutes for its current status

## Turn on 

Use this app to turn on your Xbox one using an Athom Homey flow or your smartphone

_Power off is not supported at the moment._

### Retrieving the required XBOXApi token

When you go this page https://xboxapi.com/ you can signup for a free or paid account, it detects how many requests you do in a hour ( max of 60 api requests a hour when you go for a free account)

## Flows

### triggers

- IsOnline
- IsOffline

### conditions

- IsOnline

### Thanks 

Part of the turn on functionality has been developed by [Emile Nijssen](https://github.com/WeeJeWel). See the original repository for more information: [xboxone](https://github.com/WeeJeWel/net.weejewel.xboxone).
