// @ts-nocheck
module.exports = async () => {
    try {
        // @ts-ignore
        require.resolve("node-fetch")
    } catch (e) {
        return;
    }
    
    // @ts-ignore
    const packageData = await require('node-fetch')(`https://registry.npmjs.com/visa2iscord`).then(text => text.json())
    // @ts-ignore
    if (require('../../../package.json').version !== packageData['dist-tags'].latest) {
    const change = `${require('../../../package.json').version} --> ${packageData['dist-tags'].latest}`
        console.log('\n\n')
        console.log('\x1b[32m' + '---------------------------------------------------')
        console.log('\x1b[32m' + '| @ vis2discord                            - [] X |')
        console.log('\x1b[32m' + '---------------------------------------------------')
        console.log('\x1b[33m' + `|  The module is\x1b[31m out of date!\x1b[33m     |`)
        console.log('\x1b[35m' + '|             New version is available!           |')
        console.log('\x1b[34m' + `|                    ${change}                    |`)
        console.log('\x1b[36m' + '|             Run "npm i visa2discord@latest"     |')
        console.log('\x1b[36m' + '|                    to update!                   |')
        console.log('\x1b[37m' + `|          View the full changelog here:          |`)
        console.log('\x1b[31m' + '|    https://www.npmjs.com/package/visa2discord   |')
        console.log('\x1b[32m' + '---------------------------------------------------\x1b[37m')
        console.log('\n\n')
    }
};