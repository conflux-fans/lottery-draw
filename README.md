# Lottery-draw

## Description

Lottery draw based on smart contract to approve public and fair, it was used on conflux 2021 annual party

## Preparation

1. Deploy Contract `luckyDraw`

```sh
$ cd smartContract
$ cfxtruffle --deploy reset
```

2. Deploy frontend `lottery`

- `cd lottery`
- `yarn`
- `yarn develop`
- `yarn build`

## How to use

1. Send verify code to candidates' emails using [`codeGenerator`](./codeGenerator/readme.md)
2. `keccas256 hash of verify codes` will be generated in logs.txt, use hashes to initial white list in contract and frontend
2. Initial white list and set draw plans for contract use [the script ](./smartContract/execute/run.js)
3. Config frontend follow [how to use frontend](#jump)
4. Candidates register with wishes and blessing from frontend or call contract method `register`
5. Draw by drawer from frontend or call contract method `draw`
6. Cfx will auto send to winner's account

<span id="jump"></span>
## How to use frontend

### 1. Config:

1. add contract abi in `/src/utils/abi.json`, add contract address in `/src/utils/config.js`.
2. add prize info in `/src/utils/config.js`, include background image and prize detail
3. add lucky guys' avatar image in `/src/images/avatar`, and config image reference in `/src/utils/data.js`.
4. add keccak256 hash of verify code and lucky guys' name mapping in `/src/utils/nameHash.json`, verify code comes by `codeGenerator`.
5. customize end page style and content in `/src/pages/bye.js`.

### 2. Notes:

1. contract provide reset, frontend can perform this action in end page, default is hidden. And be attention of gas value config.
2. contract excute is asynchronous, frontend will be polling for the transaction status, this is safe when weak network env, and need to refresh browser.
3. be attention of lucky guys' name should be not repeatted.
4. prize info should be consist with config in contract.
5. there are some trick code, due to Gatsby restriction and portal SDK reference, will update later.
