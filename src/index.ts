import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

import { TargetSites, Site, SiteType } from "./sites";
import { BotConfig } from "./config";

interface Product {
    name: string;
    price: string;
    url: string;
    available: boolean;
}

// startup
console.log("Bot will parsing", TargetSites.length, "shops");

/// Init telegrambot
const bot = new TelegramBot(BotConfig.telegramToken, {polling: true});

let workerTimer: NodeJS.Timer;
let currentIndex: number = 0;

// make all sites as unavailable
for (let i = 0; i < TargetSites.length; ++i) {
    TargetSites[i].available = false;
}

function workerHandler() {
    if (workerTimer != undefined) {
        clearTimeout(workerTimer);
    }

    if (currentIndex >= TargetSites.length) {
        currentIndex = 0;
    }

    let target: Site = TargetSites[currentIndex];
    console.log("Parsing", target.url);
    
    axios.get(target.url, {
        headers: { // for prevent device blocking
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36"
        }
    }).then(result => {
        if (!result.data) {
            console.log("Index", currentIndex, "returned no data");
            handleNextSite();
            return;
        }

        let productInfo: Product;

        switch (target.type) {
            case SiteType.navershop:
                productInfo = parseNaverShop(target, result.data as string);
        }

        if (productInfo == undefined) {
            handleNextSite();
            return;
        }

        if ((target.available == undefined || target.available == false) && productInfo.available) {
            TargetSites[currentIndex].available = true;

            // Send message to telegram
            bot.sendMessage(BotConfig.targetChatID,
                `<b>${productInfo.name}</b> (${productInfo.price})
                상품을 현재 구매하실 수 있습니다.
                바로가기 => ${productInfo.url}`,
                {
                    parse_mode: "HTML"
                }
            );
        } else if (!productInfo.available && target.available) {
            TargetSites[currentIndex].available = false;

            // Send sliently
            
            bot.sendMessage(BotConfig.targetChatID,
                `<b>${productInfo.name}</b> (${productInfo.price})
                현재 위 상품의 판매가 중단되었거나 구매가 불가능합니다.`,
                {
                    parse_mode: "HTML",
                    disable_notification: true
                }
            );
        }

        handleNextSite();

    }).catch(error => {
        // some sites can be unaccessable because of heavy access
        console.log("Index", currentIndex, "returned server error");
        handleNextSite();
    })
}

function handleNextSite() {
    currentIndex += 1;

    // Next queue after 1s
    workerTimer = setTimeout(workerHandler, 2000);
}

function parseNaverShop(target: Site, response: string): Product {
    let canBuy: boolean = false;
    let productName: string = "";
    let productPrice: string = "";

    let tmp: string = response.split("<span class=\"buy\"")[1];
    tmp = tmp.split("</a>")[0];

    // Can user buy this product? (by masking class)
    if (tmp.indexOf("<span class=\"mask2\"") <= -1) {
        canBuy = true;
    }

    // Get product name
    tmp = response.split("<dt class=\"prd_name\">")[1];
    productName = tmp.split("<strong>")[1].split("</strong>")[0].trim();
    
    // Get price
    tmp = response.split("<strong class=\"info_cost")[1];
    productPrice = tmp.split("class=\"thm\">")[1].split("</span>")[0].trim();

    return {
        name: productName,
        price: productPrice + "원",
        url: target.url,
        available: canBuy
    };
}

// Start bot
workerHandler();