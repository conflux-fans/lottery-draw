// var contract = require("@truffle/contract");
var content = require("../build/contracts/LuckyDraw.json");
const sdk = require("js-conflux-sdk");
const { genBatchVerifyInfo } = require("../lib/codeGen");
const { send } = require("@openzeppelin/test-helpers");
const fs = require("fs");
const { inspect } = require("util")
const { cfx, iluckyDraw, sender, players, whiteList, drawers, registersCode, networkType } = initEnv("test")

run()
// decodeDrawEvent()

function initEnv(netType) {
    env = {
        test: require("./enviorment/testnet.json"),
        main: require("./enviorment/mainnet.json")
    }[netType]

    const cfx = new sdk.Conflux({
        url: env.url,
        networkId: env.networkId,
        // logger: console
    })

    // console.log(`env.networkId:${env.networkId}`, `content.networks[env.networkId]:`, content.networks[env.networkId])

    const iluckyDraw = cfx.Contract({ abi: content.abi, address: content.networks[env.networkId].address })
    cfx.wallet.addPrivateKey(env.from.privateKey)

    return {
        cfx, iluckyDraw,
        sender: env.from.address,
        players: env.players,
        whiteList: env.whiteList,
        drawers: env.drawers,
        registersCode: env.registersCode,
        networkType: netType
    }
}

async function run() {
    if (networkType == "test") {
        const verifyInfos = genBatchVerifyInfo(players.length - whiteList.length);
        whiteList.push(...verifyInfos.map(i => i.hash))
        registersCode.push(...verifyInfos.map(i => i.code))
        console.log("verifyInfos:", verifyInfos)
        console.log("players", players)
    }

    await reset(true, true)
    await initialContract()
    await register()
    await setDrawer()
    await setStartTime()
}

async function reset(resetRegisterd, resetDrawPlans) {
    await iluckyDraw.reset(resetRegisterd, resetRegisterd).sendTransaction({ from: sender }).executed()
    console.log("reset done")
}

async function initialContract() {

    console.log(iluckyDraw.address)

    // deposite to contract if test
    // if (networkType == "test") {
    // let need = (66 * 10 + 88 * 8 + 166 * 6 + 188 * 3 + 288 * 2 + 500) * 1e18
    let need = 0
    if ((await cfx.getBalance(iluckyDraw.address)) < need)
        await cfx.sendTransaction({ from: sender, to: iluckyDraw.address, gas: 30000, value: need }).executed()
    // }
    // return

    let admin = await iluckyDraw.getAdmin()
    console.log("admin:", admin)
    // return

    let bWhiteList = whiteList.map(i => Buffer.from(i.substr(2), 'hex'))
    console.log("white list:", whiteList)
    // return

    await iluckyDraw.initalWhiteList(bWhiteList).sendTransaction({ from: sender }).executed()
    console.log("init white list done")
    // return

    // add plan 
    await iluckyDraw.addDrawPlan(5, 1, 4, 0).sendTransaction({ from: sender }).executed()
    await iluckyDraw.addDrawPlan(5, 2, 4, 0).sendTransaction({ from: sender }).executed()
    await iluckyDraw.addDrawPlan(4, 1, 5, 0).sendTransaction({ from: sender }).executed()
    await iluckyDraw.addDrawPlan(3, 1, 3, 0).sendTransaction({ from: sender }).executed()
    await iluckyDraw.addDrawPlan(2, 1, 2, 0).sendTransaction({ from: sender }).executed()
    await iluckyDraw.addDrawPlan(1, 1, 1, 0).sendTransaction({ from: sender }).executed()

    console.log("add standard draw plan done")
    for(let i = 1; i <= 20; i++) {
        await iluckyDraw.addDrawPlan(6, i, 1, 0).sendTransaction({ from: sender }).executed()
        console.log(`add extra draw plan ${i} done`)
    }

    console.log("add draw plan done")

    console.log("whitlist num:", await iluckyDraw.getWhiteListNum())
    console.log("draw plan num:", await iluckyDraw.getDrawPlanNum())
    console.log("next draw step:", await iluckyDraw.nextDrawStep())
    // console.log("get player:", await iluckyDraw.getPlayerByAddress(sender))
}

async function register() {
    let nonce = Number.parseInt(await cfx.getNextNonce(sender))
    for (let i = 0; i < registersCode.length; i++) {
        const account = cfx.wallet.addRandom();
        let tx = cfx.sendTransaction({ from: sender, to: account.address, value: 5e17, nonce: nonce++ })
        await tx;
        await iluckyDraw.register(registersCode[i], `我是${players[i]}`, `我是${players[i]}, cfx to the moon`).sendTransaction({ from: account })
        if (i == registersCode.length - 1) {
            await tx.executed()
        }
        console.log(`user ${account} register ${registersCode[i]} done`)
    }
    // console.log("check is registerd:", await iluckyDraw.checkIsRegisterd(sender))
    console.log("registered done:", await iluckyDraw.getRegisters().then(i => i.length))
}

async function setDrawer() {
    const receipt = await iluckyDraw.updateDrawers(drawers).sendTransaction({ from: sender }).executed()
    console.log("set drawer done:", await iluckyDraw.getDrawPlanNum())
}

async function setStartTime() {
    if (networkType == "main") {
        await iluckyDraw.setRegisterStartTime(Math.round(new Date('2021-01-20T02:00:00.000Z') / 1000)).sendTransaction({ from: sender }).executed()
        await iluckyDraw.setDrawStartTime(Math.round(new Date('2021-01-22T08:00:00.000Z') / 1000)).sendTransaction({ from: sender }).executed()
        console.log("registerStartTime", await iluckyDraw.registerStartTime())
        console.log("drawStartTime", await iluckyDraw.drawStartTime())
    }
}

async function decodeDrawEvent() {
    const receipt = await cfx.getTransactionReceipt("0x2058be9d04f9ef1225030e1775a6e2f778cbe21653e31c8728303fc958f0fa5a")
    console.log("draw info:", iluckyDraw.abi.decodeLog(receipt.logs[0]).object.drawInfo.luckyGuys)
}

process.on('uncaughtException', (err, origin) => {
    fs.writeSync(
        process.stderr.fd,
        `Caught exception: ${inspect(err, false, 5, true)}\n` +
        `Exception origin: ${inspect(origin, false, 5, true)}`
    );
}).on('unhandledRejection', (reason, promise) => {
    fs.writeSync(
        process.stderr.fd,
        `Unhandled rejection: ${inspect(reason, false, 5, true)}\n` +
        `Promise: ${inspect(promise, false, 5, true)}`
    );
});