import {
    mintCusd
} from './mintCusd'
import {
    burnCusd
} from './burnCusd'
import {
    transferCusd
} from './transferCusd'
import {
    getMinter,
    getOwner
} from '../getUsers'
import {
    balanceOf
} from './balanceOf'

const main = async () => {

    // Test newly upgraded token contracts
    const amountToMint = 1*10**18
    const amountToSend = 0*10**18
    const amountToBurn = amountToMint-amountToSend
    const user = getMinter()
    const anotherUser = getOwner().address

    await balanceOf(user.address) 

    // // 1. Mint to user
    // await mintCusd(amountToMint, user.address)

    // await balanceOf(user.address)
    // await balanceOf(anotherUser)

    // // 2. Transfer to another user
    // await transferCusd(amountToSend, user, anotherUser)

    // await balanceOf(user.address)
    // await balanceOf(anotherUser)

    // // 3. Burn
    // await burnCusd(amountToBurn, user)

    // await balanceOf(user.address)

    return
}

main().then(result => {
    process.exit()
})
