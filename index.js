/* jshint esversion: 6 */
var builder = require('botbuilder'),
    VK = require("VK-Promise"),
    channelId = "sms";
function Create(options) {
    options = Object.assign({channelId: channelId}, options);
    var vk = new VK(options.access_token);
    vk.replyCnt = 0;
    vk.onEvent = (handler) => vk.handler = handler;
    vk.onInvoke = (handler) => console.log("vk.onInvoke", arguments);//vk.handler = handler;
    vk.startConversation = () => console.log("vk.startConversation", arguments);
    vk.listen = function(){
        return vk.init_callback_api(options.callback_key);
    };
    vk.send = function(messages, cb){
        Promise.all(
            messages.map(msg => vk.messages.send({peer_id: msg.address.user.id, message: msg.text}))
        ).then(cb.bind(this, null), cb);
    };
    vk.processMessage = function(message){
        var msg = new builder.Message()
            .address({
                channelId: options.channelId,
                channelName: "vk",
                msg: message,
                user: { id: message.peer_id, name: "@id" + message.peer_id },
                bot: { id: options.group_id, name: "@club" + options.group_id},
                conversation: { id: "vk" + options.group_id }
            })
            .timestamp(message.date * 1000)
            .entities()
            .text(message.body);
        vk.handler([msg.toMessage()]);
        return vk;
    };
    vk.on("message",function (e, msg) {
        e.ok();
        vk.processMessage(msg);
    });
    Object.assign(vk, options);
    return vk;
}
module.exports = Create;
