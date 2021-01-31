# Lottery-draw

## Description
Lottery draw based on smart contract to approve public and fair, it was used on conflux 2021 annual party

## Preparation
1. Deploy Contract `luckyDraw`
```sh
cfxtruffle --deploy reset
```
2. Deploy frontend server `lottery`
## How to use
1. Send verify code to candidates' emails using [`codeGenerator`](./codeGenerator/readme.md)
2. Initial white list in contract and set draw plans use [the script ](./smartContract/execute/run.js)
3. Initial white list in frontend
4. Candidates register with wishes and blessing
5. Draw