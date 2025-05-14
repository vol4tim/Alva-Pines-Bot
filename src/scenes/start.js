import { Markup } from "telegraf";
import bot from "../bot";
import { config } from "../config";
import Profile from "../models/profile";

export function start() {
  bot.use(async (ctx, next) => {
    const profile = await Profile.findOne({
      where: { userId: ctx.from.id.toString() }
    });
    if (profile === null) {
      await Profile.create({
        userId: ctx.from.id.toString(),
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name
      });
    }
    await next();
  });
  bot.start(async (ctx) => {
    const profile = await Profile.findOne({
      where: { userId: ctx.from.id.toString() }
    });
    if (profile === null) {
      await Profile.create({
        userId: ctx.from.id.toString(),
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name
      });
    }
    const buttons = [];
    buttons.push([
      Markup.button.callback("Активировать промо предложение", `activate`)
    ]);
    buttons.push([
      Markup.button.callback("Связаться с инженером компании", `contact`)
    ]);
    buttons.push([Markup.button.callback("Узнать стоимость услуг", `price`)]);
    await ctx.reply(
      "Привет! Я - Alva Pines, автономный агент компании Pinout. Мы помогаем на острове с тем, чтобы сделать вашу жизнь максимально беззаботной и поможем в задачах заботы о здоровье семьи в доме. Доступные на сегодня функции бота:",
      Markup.inlineKeyboard(buttons).resize()
    );
  });

  bot.action("activate", async (ctx) => {
    await ctx.answerCbQuery();
    ctx.replyWithHTML(
      "Ваш промокод на бесплатный один товар на следующий заказ в магазине https://shop.pinout.cloud <code>AlvaPinesTheBest</code>. Воспользуйтесь им в течении 30 дней пожалуйста."
    );
  });
  bot.action("contact", async (ctx) => {
    await ctx.answerCbQuery();
    const message = `С тобой хочет связаться @${ctx.from.username}`;
    await bot.telegram.sendMessage(config.manager, message);
    ctx.reply(
      "Я пепеслала ваш контакт инженеру Вадиму Манаенко. Вот его контакт в телеграмм @vourhey, напишите сами или Вадим напишет вам в течении ближайших 2 часов рабочего дня."
    );
  });
  bot.action("price", async (ctx) => {
    await ctx.answerCbQuery();
    ctx.reply(
      "На нашем сайте есть специальный раздел для самостоятельного ознакомления с примерными сметами на апгрейд вашего дома: https://pinout.cloud/solutions"
    );
  });
}
