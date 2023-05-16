module.exports = async (client) => {

client.on("threadCreate", async (thread) => {
    try{
        if(thread.joinable && !thread.joined){
            await thread.join();
        }
        } catch (e){
            console.log(`[visa2discord] Auto Thread Joiner Failed with error: ${e}`)
            }
})
}