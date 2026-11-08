const { Telegraf } = require('telegraf');

// আপনার বটের টোকেন
const bot = new Telegraf('8985086491:AAEtWw4wp9xeLCxE2D t9Jtxc_2_zNJR3Vgc');

// আপনার দুটি চ্যানেলের ইউজারনেম
const CHANNEL_1 = '@mvs_task_bot0';
const CHANNEL_2 = '@MVS_TASK_support_Group';

// আপনার হোস্টিং করা ওয়েবসাইটের লিংক (GitHub Pages)
const webAppUrl = 'https://mvs4x9-eng.github.io/mvs-task-bot/';

// ১. /start কমান্ড হ্যান্ডেল করা
bot.start(async (ctx) => {
    const startPayload = ctx.payload; // রেফারেল আইডি ধরার জন্য

    // ইউজারকে চ্যানেল জয়েন করার ইনলাইন বাটন পাঠানো
    await ctx.reply(`স্বাগতম! আমাদের সাইটে কাজ করতে হলে নিচের দুটি চ্যানেলে অবশ্যই জয়েন করতে হবে। জয়েন করার পর 'ভেরিফাই করুন' বাটনে চাপ দিন।`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "📢 চ্যানেল ১ এ জয়েন করুন", url: `https://t.me/mvs_task_bot0` }],
                [{ text: "💬 সাপোর্ট গ্রুপে জয়েন করুন", url: `https://t.me/MVS_TASK_support_Group` }],
                [{ text: "🔄 ভেরিফাই করুন", callback_data: `verify_${startPayload || ''}` }]
            ]
        }
    });
});

// ২. ভেরিফাই বাটন ক্লিক করলে চ্যানেল জয়েন চেক করার লজিক
bot.action(/^verify_(.*)$/, async (ctx) => {
    const userId = ctx.from.id;
    const startPayload = ctx.match[1];

    try {
        // চ্যানেল ১ চেক করা
        const chatMember1 = await bot.telegram.getChatMember(CHANNEL_1, userId);
        const isJoined1 = ['member', 'administrator', 'creator'].includes(chatMember1.status);

        // চ্যানেল ২ চেক করা
        const chatMember2 = await bot.telegram.getChatMember(CHANNEL_2, userId);
        const isJoined2 = ['member', 'administrator', 'creator'].includes(chatMember2.status);

        if (isJoined1 && isJoined2) {
            // ভেরিফাই সফল হলে মিনি অ্যাপ খোলার বাটন দেখানো
            await ctx.editMessageText(`✅ আপনার ভেরিফিকেশন সফল হয়েছে! এখন নিচের বাটনে ক্লিক করে সাইটে প্রবেশ করুন।`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🚀 MVS Task সাইট ওপেন করুন", web_app: { url: `${webAppUrl}?ref=${startPayload}` } }]
                    ]
                }
            });
        } else {
            // যদি জয়েন না করে থাকে
            await ctx.answerCbQuery(`❌ আপনি এখনো সবগুলো চ্যানেল বা গ্রুপে জয়েন করেননি! দয়া করে জয়েন করে আবার ভেরিফাই করুন।`, { show_alert: true });
        }
    } catch (error) {
        console.log(error);
        await ctx.answerCbQuery(`⚠️ একটি ত্রুটি হয়েছে। নিশ্চিত করুন বটটি চ্যানেল দুটির অ্যাডমিন হিসেবে আছে কিনা।`, { show_alert: true });
    }
});

// বট যেন হঠাৎ বন্ধ না হয়ে যায়
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

bot.launch();
