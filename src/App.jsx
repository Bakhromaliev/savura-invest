import React, { useState, useEffect } from "react";

const C={bg:"#060a14",bg2:"#0b1628",card:"rgba(13,22,42,0.85)",border:"rgba(74,163,255,0.1)",borderHi:"rgba(74,163,255,0.28)",blue:"#2f7df6",blueLt:"#4aa3ff",green:"#37b24d",greenLt:"#52d869",amber:"#f0a92b",orange:"#e8590c",red:"#e5484d",text:"#edf2ff",dim:"#8ea0c4",faint:"#4a5c82"};

const FOUNDER_PHOTO="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCADIASwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCqlvCQd17Av5mlENrnm7B+imu2TSLBelsn5VOmn2i9LeP8qy5mL2MOxw4jtMYE0jfSM05YYP4Y7pvomK71bWAdIUH/AAGpliQdEUfhRdj9nBdDgRbqfu2l2fyqZbORvu6bcH6tXeBQOwpwou+4+SPY4YabeN93S/8AvpzUqaRqJHGnwj6sTXbClo1Hyx7HGLoeqnpb2y/hU66BqxwS1sv0SuuApRRYehyo8Paow5vUX/dQU9fDV6eG1Fhn0A/wrqMUYosBzS+FHP39QnP0OKkHhSIjDXlwR/vmuioxRZDuc+PCVh/E8rfVjUi+FdLU5MRY+5rbxSgUWQGdFoenxD5bZPxqytjbJ92BB+FWcUYpgRiGNeiKPoKdsHoKeBRigQ3bRin4pKAG4pcUuKUCiwDcUYp2KMUANxSYp2KMUANIpMU+kxSsMZijFOxRiiwhhFIRT8UhFFgIiKaRUpFNIosMiIpmKmIppXmiwiqKkUU0CpAKLAKKeKQCnCnYBRS0ClAosADrTqAKcKLAJSgUuKUU7AApcUoFLiiwDR9KUClxSgUWAbigU6jFACUuKUClOFBJIAHJJoATFG2uG174raBpEj29qZNQuF4PkY8sH03H+ma5o/Gm7Mq7NDhEZ7NO2fzxTswuj17FJiuK0b4p6DqCKt8X06cnBEg3J/30O31FdtDLFcwpNBIksTjKujZBHsRSsFxMUuKdijFADcUYp2KMUWAbikxT8UYp2AbikxT8UYosIjIpMVIRSYpWGMxSYqTFIRRYCIikIqQimkUgIyKZipSKaRzQBTAqQCminimAopwpKcBQAoFOApBSjrQAoFOxQBSigBQKUCgUopiACnAUAUtABijFLRQA3FHSlNMJxQMXdXGfFHV5NM8F3CQuFku2FuOedp5bH4D9a61pMVwfxTtFvfD1pIxO2G8j34P8LfKT/KkFjyTRvDV7rADRQ7Ix/G3Q110Xw4klVd98wwOipXY+H7eOO0EccYAA4rYnmhsIWnu5o4YQPvMaxdWbeh2RoQS948g1jwNd6fbvNbz+YIwWKkYJHtXV/BbWJnmv9IkcmMKJ41J+6c4OB+IrRvNTttSSSG1MgZlIRpImVX47E1g/Cmylj8e3JKGPyLaQSKe2WAx+daU5SaakYVoRVnA9txSYpxFFWZCYopcUUxDaKXvRQA2inUlADcUUtFIBuKTFOoxQMYRTSKkIppFAEZFNIqUimEc0AUgKeKQU4UgFFOFIKUUAOFOApAKdimIUUtIKcKAAU4UgpwoAUdaWgUUwFoNFLigBjVCxqZhUDikxlG5mKmsHWgmoaReWsvKSRMPoRyD+YFbF6tZMi5JB6Hg1DKRxdhpNyko8qG4ds5e5kuXHOM/KoIGM+tdQbe51LS7RmcC5Gct7g9qt6XNDHbskjABMjJ9qqWN1M8Ua70ESOdp2jJHrmsW2zugopFqz0a4hjD3F9c3AHJWZgQPpxUGg2Edp4pvLuLAeZosY6nqCP5GttbqO5tv3ThgMgketVtBtlm1qf5seSFf9aI3ctBT5VE64igCnYpMV1HnhikIp1JQIbiil70lAwpKWigBtFLSGkAlFLSUAJSGloNADDTTTzTTQMogU4U0U4UgHCnCminCgB4pRTRThTEKMU4U2nCgY4U4U0U8UxC96Wk707vQIMUY4opaBjGqJxnrU5FRsDjmgDMvF+XpWNIuGroLhcoc1jzr83FQy0Yt8gtxI7x7oJBhiP4T71Q020tVIUrEyc53nNT6t4u0jR2NvNL9ouCdv2eHDHnjDHoPxrPuvDU9hqDRGSRYT80ZzwV/zxWcoW946KVV/CtzakvY7NSkG3n+FOlaGmXA8N6JdeIdTVlt5HRDj7wQtjcB35PTvg1e8LeDE+S81BSU6xxN/F7n29q4X42eJjcajF4ctXAgtcS3G3vIR8q/8BBz9T7VpSpW95mdetf3UeuwTw3dvHcW8qSwyqGSRDlWB7g1Jivmnwz4+1vwqn2ezmjltC242067lB77e659q9X0D4u6FqhSHUUk02c/xSHdET/vDkfiK0aZz3O+xSEUsUkc8KzQyLJE4yrowZWHsR1pSKQxmKKU9aKAEpKdSUAJSUppKQCUUtJQAlIaWkNAxppD1pxppoAoUopBThUjFFPFNFOFMQ4U6minUwFFOFNBpwoAcKfTAacDTEOpabThQIWgetKMUdulAwPTrULkVIxwKqTS7aTYJGJ4q8RWnhrR3vrpWkJYJHEpwZGPb29Sa8X1/4iaxrAaGArY27cFYSdxHu3X8sVu/GHUmn1LTrAH5IommI/2mOB+i/rXmZqopWuDZs+FNLbWvE9jZDOJJdzEeijcf5V39/wDE/VE1i+tFsLRobWYpD5wJ2FeMnsc4zVH4Lad9p8T3V4VyLa2IU+jMQP5ZqfwTo9n4g8eazNdIJLS3uHkERztdi5Az7DGcd62itDNs9Z0zxyr+Cpdf1SxexMUTSbGOVlwONvcbj0B557181Xl6+q6rcXl/PiW4kaaVsEksTnA/kK9X+MetC2sbHQIWw0h+0zgf3Rwo/E5P4V4uxyxpSXRAhcgudoOM96coOafHHhc0oXP54pDNjRvEms6AQ+najPAuc+UGzGfqp4r3D4feM38XabOt2kcd/asBIIxhXU9GA7dCCK+e5Oldr8Ir17bx1FACdl1BJGw9cDcP1Wpkho9+NJTjSVBQlFFJQAGkpaSgBKKWkoASkNLSUhjaSlpDSAzxThTBThQA8UtNFKKAHA+tPplOFADs07NNFLTAeDTgajBp2aBD804EVFml3UwJgRQWGKryzrBBJM+dsaFzgZOAMmuKPxR0xhlLC8YHpkqP60AdvI/FZl7KQprln+Jdow+XTZ/xlX/CqM/j1Jj8unsPrL/9apaZSaPNfHV8b/xfeknKwkQr9FH+Oa5tq6e50P7Zez3Ut22+aRpGwncnPrTB4ZgPW6l/BRWi0RDO8+HsyeGfhjrviGQDexKxZ7sBtUf99N+lTfBGAnT9YuJDw1xCpc+oBJ/nmsG4nNz4OtvDOTHaQy+aZE+/Ick89sZP6CrGiajNoXh670ayIEN2zM8rf6wbl28HoOPatVJXI5Wcn4x1s6/4n1DUQSY5JSsI9I14X9Bn8awIxukArU13TE0yaERMxilTK7uoIOCP5VnwD58+lTuMmchUwOtMQ/vVX0GT9aew3AetV4nzduT64pgWZK3PANw1t490WRe90EP0YFT/ADrDl6A1o+E2lTxjo7QAGX7ZFtB7/MP6ZqZAj6iPSmmnt1OOlMNZliUUUUgCkoNFMBKQ0tJQAU2lNJSGJSUtJQBmg04GmA0ZpDJAacDUYNOFAEgNOBqIGng0JiH5p2ajBp2aAHZp2eKZmjdQmDHE0E0wtTWfApthYlDA8EZHcV4Jq1idL1y9se0MzBf908r+hFe4GbBrzP4iWgj1u3vlHy3EWxj/ALS//WI/KhMGjlVqQVGvSpBVCHg08Gq09xHbReZKcLnHTPNOtblbmESL06H60AWQakQ81CKkU0wKPiqHzNIgnA5ilwfow/xArloeua7fUovtOhXkWMkR7x9V5/pXExcR5q0SxWOCaq25zcH60+VyQRUEJ2vn3oEaTcgitTwYwTxvohYZAvY/51k54z2NanhNS3jTRQO97F/6EKJbAj6hamGnt3phNZFiUUUUhhRRSUAJRRSUAFJRRQAhpKU02gDMzRnmmg0tSMcDTgajBpwNAEgNOBqMGnA8UICQGnZqMGnZpgOzQTSZpDQIRjUbHinmo2FIZUlfbXLeNYPtegPIBl7dxKPp0P6H9K6m4TINZd1bi4glhf7silD9CMUrjPJ0bipAagKNbzSQycPGxRvqDinh61IHyxpPEY5BlT1ptrax2oYRlsMcnJzTg1PDUASA09TUIanhqAL9qQzbG+6w2n6HiuClia3keFhgxuUP4Gu1hkwwrmvEKCPWJgAT5mJAAPUf45q4ksxZPvGoQ22TIGT6VNKkvGY2UH+8MU1ICSM8mgRNEzsCW4HtzW94LZT440TnOL2P+dYyxYXOCPrWn4Vikk8ZaKsOS5vYsY68MCf0zQ9gPqNjTDTmOc0wnisjQKKTNLQAUhozRmgBKKKSgApKKSgANNpTSZpAZANOzUQNOBpDHg04Go804GkBJmnA8VGDTgaYEgNOzUYNKDTAkzRmm55pc0AKaYRmnikxQIgkTK1Rkj61qFeKryJSGcnfeGtLu7iS4ltj5r8syuVyfX61h3/hC2cj7Jcy25HBBHmA/n3rvJo/asq5TDVLbRSSZxWpJoPhyKyGoxXE5kYqXRyC2O5A6DntU1qvhDUPmgvXBJztFyoIH0YA1yvj+9+0eIVt1Py2sYX/AIEfmP8ASuQKKztwOucVcYtq9x+0S0sme1J4e0CUHy7u65HB3Aj8wOarX3hW3iiiezv5ZcyAPlVyF715RbXFzZfNbXMsJHTy3IrZg8X6zZ7TJLHcr0/erz+YpuMlsNVKb3R1PiHTl03TJbqwuXkKSKoMi8YPX9a46fU9TnwklyUGMARqF/XrXRa/rcd54egMV1E4mlBMcfBXaOdwJyDk/jXKfaBVwTt7xlUcXL3RvlnIdss5b7xOTTlK8kDPP5UjzBh8uc/SoGOeSuG9QaszLG6SWRY0RmdjhVUZJPsK9Y+GngDUtP1aPXtViNqI0byLdx87FhjcR/DgH61c+CwsZtCvH+yQfb7e42tPsG8oygrz17GvTzWcpPYpICeKbQTSVJQUUUUAFJRRQAUUUlABSGlpDQAhplONNoAxQadmo1NPBqRjs04UzNKDSAkpwNRg04GmBIKUGmZpQaAJBS0wGnA0APFKKaDTgaaEBFROKmqKQ0mNFWUcGse6KhiT0HJ+laszfLXL+I7n7NouoTZxtgfB98YH86zZSPE9RumvtSurpjkzSs/4E8fpVJD8zt2zUhOF+gqBR8u2upGTLWMofpTmUPEPcVEkhB+bkHqe9SxHdEvtxVEiRQ4BJY5NSBcGnr0oPWgBKjepaiYZahgem/Ba+8jxDf2BPFzah1H+0jf4Ma9sPSvmvwBf/wBnePNImLYR5vJb6OCv8yK+kzWcty0Ic0gNITRUDHUUlFMQUUlJmgYtJRSGgBaaTS03NAATTc0pptIDCBp4aq+eakBqRkoanZqIGnA0ASBqcDUQpwNAyXNOBqIGnA0xEoNOBqIGnA0wJAaeDUINPB5oESE1DIeKeTxUT0mNFK5bCmuE8e3Pk+F7lc8yukY/E5P8q7q6G5TXn/j7TL/UdNgjsovN8uXe6KfmPGBgd+pqF8RT2PJZD8uPWmqK0tZ0mXSJreC4P754RI6j+Eknj8hVFBxXStTFigU63ON6ehyKB1poYJcK38J4NMC2vSg0opKYgqM9TUh4FQt1oYElvO1tcxXCHDQusg+oOf6V9YQzrdW0VwhykqLIp9iM/wBa+TAOD719JeAr46h4F0iZsllg8pj7oSv9BWcionRmkzRmkqCh2aM03NLTAKKSkzQApopM0maQC02jNITQAhpM0E03NMDngelPBooqRjgacCaKKAHZpc0UUgHBqcDRRQMcDTs0UUxCj6mpAaKKYhc0xjRRQMqTDg1j3i4aiis2UjyT4gc+I1Hpbp/M1zCjiiiuiHwozluObhKjIDriiiqJJ4Jdy7G++P1qYUUU0IaxHrUZPNFFIZ794V+H3hy30WwvLjT4ru7lgSV3mYyLuIB+UHjH4V2qRpFGscaKiKMKqjAA9ABRRWRaCjtRRSAKKKKAA0lFFACUUUUhjaQmiimIaTTM0UUMD//Z";

const LANG = {
  uz:{
    tagline:"FUNDAMENTAL TAHLIL \u00b7 AQSH BIRJASI",
    h1:"Aksiyaning", h2:"fundamental holati qanday?",
    sub:"Aksiya belgisini yozing \u2014 kurs metodologiyasi bo'yicha to'liq tahlil.",
    ph:"Masalan: AAPL, TSLA, KO...", btn:"Tekshirish", btnL:"Tahlil...",
    loading:"Finnhub dan real vaqt ma'lumot olinmoqda\u2026",
    errNF:"Aksiya topilmadi.",
    errLive:"Real ma'lumot uchun Finnhub kalitini qo'shing (o'ng yuqori). Namuna: AAPL MSFT NVDA TSLA KO JPM.",
    riskT:"RISK DARAJASI", riskTag:"15 savol",
    noQ:(n)=>`${n} ta "yo'q"`, showQ:"15 savolni ko'ring \u25bc", hideQ:"Yopish \u25b2",
    fundT:"FUNDAMENTAL \u2014 5 TOIFA", sample:"namuna",
    note:"Ma'lumot: stockanalysis.com \u00b7 Savura Invest kurs metodologiyasi \u00b7 Investitsiya tavsiyasi emas.",
    rI:"Ijobiy", rO:"O'tacha", rS:"Salbiy",
    lL:"PAST", lM:"O'RTA", lH:"YUQORI", lVH:"JUDA YUQORI",
    qa:"Ha", qn:"Yo'q",
    cats:{growth:"O'sis",valuation:"Baholanish",profitability:"Rentabellik",health:"Mol. sog'lomlik",efficiency:"Samaradorlik"},
    rq:["Moliyaviy sog'lomlik ko'rsatkichlari o'tacha yoki yuqori?","Rentabellik ko'rsatkichlari o'tacha yoki yuqori?","Samaradorlik ko'rsatkichlari o'tacha yoki yuqori?","O'sis ko'rsatkichlari o'tacha yoki yuqori?","P/E bozor o'tachasiga yaqin yoki kichik?","O'gan yil va chorakda foydali bo'lganmi?","Operatsion pul oqimi musbat bo'lganmi?","Beta 1.5 dan kichikmi?","Bozor kap. $2 mlrd yoki ko'pmi?","Himoya qiluvchi sektordami?","Sanoatida top-10 ichidami?","Geosiyosiy/huquqiy muammo yo'qmi?","So'nggi 5 yilda S&P 500 dan ustunmi?","Kutilmagan risklar (har doim yo'q)","Kutilmagan risklar (har doim yo'q)"],
    tf:{
      badge:"FUNDAMENTAL TAHLIL VOSITASI",h1:"Aksiyaning fundamental holati",h2:"qanday?",
      sub2:"Aksiya belgisini kiriting, keyin stockanalysis.com dan ma'lumotlarni o'zingiz kiritasiz.",
      nextBtn:"Keyingi",sampleNote:"Namuna tugmalarini bossangiz - ma'lumotlar avtomatik to'ldiriladi.",
      backBtn:"Orqaga",manualBadge:"QO'LDA KIRITILADI",autoLabel:"Ma'lumotlar avtomatik",
      instrText:"stockanalysis.com saytiga kiring - aksiyani qidiring - Statistics sahifasini oching.",
      grp:["O'sish","Baholanish","Rentabellik","Moliyaviy Sog'lomlik","Samaradorlik","Bozor Ma'lumotlari"],
      compInfo:"KOMPANIYA MA'LUMOTLARI",boolSec:"Qo'shimcha savollar",
      boolSub:"Quyidagi savollarga javob bering - yoki AI yordamida aniqlang",
      aiBtn:"AI Prompt",aiInstr:"Nusxa oling, Claude.ai yoki ChatGPT ga yuboring",
      aiCopy:"Promptni nusxalash",aiCopied:"Nusxalandi!",
      analyzeBtn:"Tahlil Qilish - 15 Savol",analyzeNote:"Kiritilgan ma'lumotlar asosida 15 savolga javob beriladi",
      reEnter:"Qayta kiriting",
      boolLbl:["O'tgan yilda foydali?","Operatsion pul oqimi musbat?","Himoya qiluvchi sektorda?","Sanoatda top-10 ichida?","Yirik yuridik muammo yo'q?","So'nggi 5 yilda S&P 500 dan ustun?"],
      boolHint:["Net Margin > 0","Operating Cash Flow > 0","Healthcare/Utilities/Consumer Staples/Energy","Bozor kap. bo'yicha","Davlat jarimalari yo'q","Chart 5Y tabni ko'ring"]},
  },
  en:{
    tagline:"FUNDAMENTAL ANALYSIS \u00b7 US MARKETS",
    h1:"What is the stock's", h2:"fundamental status?",
    sub:"Enter a ticker \u2014 full fundamental analysis per course methodology.",
    ph:"e.g. AAPL, TSLA, KO...", btn:"Analyze", btnL:"Analyzing...",
    loading:"Fetching real-time data from Finnhub\u2026",
    errNF:"Stock not found.",
    errLive:"Add Finnhub key for live data (top right). Sample: AAPL MSFT NVDA TSLA KO JPM.",
    riskT:"RISK LEVEL", riskTag:"15-question model",
    noQ:(n)=>`${n} "No" answers`, showQ:"Show 15 questions \u25bc", hideQ:"Hide \u25b2",
    fundT:"FUNDAMENTALS \u2014 5 CATEGORIES", sample:"sample",
    note:"Data: stockanalysis.com \u00b7 Savura Invest course methodology \u00b7 Not investment advice.",
    rI:"Positive", rO:"Average", rS:"Negative",
    lL:"LOW", lM:"MEDIUM", lH:"HIGH", lVH:"VERY HIGH",
    qa:"Yes", qn:"No",
    cats:{growth:"Growth",valuation:"Valuation",profitability:"Profitability",health:"Financial Health",efficiency:"Efficiency"},
    rq:["Financial health metrics avg or above?","Profitability metrics avg or above?","Efficiency metrics avg or above?","Growth metrics avg or above?","P/E near or below market average?","Profitable last quarter and year?","Operating cash flow positive?","Beta below 1.5?","Market cap $2B or more?","In a defensive sector?","Top-10 in its industry?","Free from geopolitical/legal issues?","Outperformed S&P 500 in 5 years?","Unexpected risks (always No)","Unexpected risks (always No)"],
    tf:{badge:"FUNDAMENTAL ANALYSIS TOOL",h1:"What is the stock's",h2:"fundamental status?",
      sub2:"Enter a ticker \u2014 then enter data from stockanalysis.com yourself.",
      nextBtn:"Next \u2192",sampleNote:"Click sample buttons to auto-fill sample data for that stock.",
      backBtn:"\u2190 Back",manualBadge:"MANUAL ENTRY",autoLabel:"Data auto-filled",
      instrText:"Go to stockanalysis.com \u2192 search for the stock \u2192 open the Statistics page. Enter all metrics below from that page.",
      grp:["Growth","Valuation","Profitability","Financial Health","Efficiency","Market Data"],
      compInfo:"COMPANY INFO",boolSec:"Additional Questions",
      boolSub:"Answer the questions below \u2014 or determine using AI",
      aiBtn:"AI Prompt",aiInstr:"Copy \u2192 Send to Claude.ai or ChatGPT \u2192 check boxes based on AI response",
      aiCopy:"Copy Prompt",aiCopied:"Copied!",
      analyzeBtn:"Analyze \u2014 15 Questions \u2192",
      analyzeNote:"The system will automatically answer 15 questions and determine risk level",
      reEnter:"\u2190 Re-enter data",
      boolLbl:["Profitable last year?","Operating CF positive?","In defensive sector?","Top-10 in industry?","No major legal issues?","Outperformed S&P 500 in 5yr?"],
      boolHint:["Net Margin > 0","Operating Cash Flow > 0","Healthcare / Utilities / Consumer Staples / Energy","By market cap","No major fines or cases","Check the 5Y chart tab"]}
  },
  tr:{
    tagline:"TEMEL ANALİZ \u00b7 ABD PİYASALARI",
    h1:"Hissenin", h2:"temel durumu nedir?",
    sub:"Hisse sembolü girin \u2014 kurs metodolojisine göre tam temel analiz.",
    ph:"ör. AAPL, TSLA, KO...", btn:"Analiz Et", btnL:"Analiz...",
    loading:"Finnhub'dan gerçek zamanlı veri alınıyor\u2026",
    errNF:"Hisse bulunamadı.",
    errLive:"Canlı veri için Finnhub anahtarı ekleyin (sağ üst). Örnekler: AAPL MSFT NVDA.",
    riskT:"RİSK SEVİYESİ", riskTag:"15 sorulu model",
    noQ:(n)=>`${n} "Hayır" cevabı`, showQ:"15 soruyu gör \u25bc", hideQ:"Gizle \u25b2",
    fundT:"TEMEL ANALİZ \u2014 5 KATEGORİ", sample:"örnek",
    note:"Veri: stockanalysis.com \u00b7 Savura Invest kursu metodolojisi \u00b7 Yatırım tavsiyesi değildir.",
    rI:"Olumlu", rO:"Ortalama", rS:"Olumsuz",
    lL:"DÜŞDÜK", lM:"ORTA", lH:"YÜKSEK", lVH:"ÇOK YÜKSEK",
    qa:"Evet", qn:"Hayır",
    cats:{growth:"Büyüme",valuation:"Değleme",profitability:"Karlılık",health:"Finansal Sağlık",efficiency:"Verimlilik"},
    tf:{
      badge:"TEMEL ANALIZ ARACI",h1:"Hissenin",h2:"temel durumu nedir?",
      sub2:"Hisse sembolunu girin, sonra stockanalysis.com'dan verileri kendiniz girin.",
      nextBtn:"Ileri",sampleNote:"Ornek dugmelerine tiklayin - veriler otomatik dolar.",
      backBtn:"Geri",manualBadge:"MANUEL GIRIS",autoLabel:"Otomatik veri",
      instrText:"stockanalysis.com'a gidin - hisseyi arayin - Statistics sayfasini acin.",
      grp:["Buyume","Degerleme","Karlilik","Mali Saglik","Verimlilik","Piyasa"],
      compInfo:"SIRKET BILGISI",boolSec:"Ek Sorular",
      boolSub:"Asagidaki sorulari yanitlayin veya AI ile belirleyin",
      aiBtn:"AI Prompt",aiInstr:"Kopyalayin, Claude.ai veya ChatGPT'ye gonderin",
      aiCopy:"Promptu Kopyala",aiCopied:"Kopyalandi!",
      analyzeBtn:"Analiz Et - 15 Soru",analyzeNote:"15 soruya otomatik cevap verilir",
      reEnter:"Yeniden Gir",
      boolLbl:["Gecen yil karli miydi?","Is.nakit akisi +?","Savunmaci sektorde mi?","Sektorde ilk 10?","Buyuk hukuki sorun yok?","5 yilda SP500 gecti mi?"],
      boolHint:["Net Marj > 0","OCF > 0","Saglik/Kamu/Gida/Enerji","Piyasa degerine gore","Buyuk ceza yok","5Y grafik"]},
    rq:["Mali sa\u011fl\u0131k g\u00f6stergeleri ortalama veya \u00fcst\u00fcnde mi?","Karl\u0131l\u0131k g\u00f6stergeleri ortalama veya \u00fcst\u00fcnde mi?","Verimlilik g\u00f6stergeleri ortalama veya \u00fcst\u00fcnde mi?","B\u00fcy\u00fcme g\u00f6stergeleri ortalama veya \u00fcst\u00fcnde mi?","F/K oran\u0131 piyasa ortalamas\u0131na yak\u0131n veya alt\u0131nda m\u0131?","Ge\u00e7en y\u0131l ve \u00e7eyrekte karl\u0131 m\u0131yd\u0131?","\u0130\u015fletme nakit ak\u0131\u015f\u0131 pozitif mi?","Beta 1.5'tan az m\u0131?","Piyasa kap. $2 milyar veya fazla m\u0131?","Savunmac\u0131 sekt\u00f6rde mi?","Sekt\u00f6r\u00fcnde top-10'da m\u0131?","Jeopolitik/hukuki sorun yok mu?","Son 5 y\u0131lda S&P 500'\u00fc ge\u00e7ti mi?","Beklenmedik riskler (her zaman Hay\u0131r)","Beklenmedik riskler (her zaman Hay\u0131r)"],
  },
  ru:{
    tagline:"\u0424\u0423\u041d\u0414\u0410\u041c\u0415\u041d\u0422\u0410\u041b\u042c\u041d\u042b\u0419 \u0410\u041d\u0410\u041b\u0418\u0417 \u00b7 \u0420\u042b\u041d\u041e\u041a \u0421\u0428\u0410",
    h1:"\u041a\u0430\u043a\u043e\u0432\u043e \u0444\u0443\u043d\u0434\u0430\u043c\u0435\u043d\u0442\u0430\u043b\u044c\u043d\u043e\u0435", h2:"\u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0430\u043a\u0446\u0438\u0438?",
    sub:"\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0442\u0438\u043a\u0435\u0440 \u2014 \u043f\u043e\u043b\u043d\u044b\u0439 \u0444\u0443\u043d\u0434\u0430\u043c\u0435\u043d\u0442\u0430\u043b\u044c\u043d\u044b\u0439 \u0430\u043d\u0430\u043b\u0438\u0437.",
    ph:"\u043d\u0430\u043f\u0440. AAPL, TSLA, KO...", btn:"\u0410\u043d\u0430\u043b\u0438\u0437", btnL:"\u0410\u043d\u0430\u043b\u0438\u0437...",
    loading:"\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0434\u0430\u043d\u043d\u044b\u0445\u2026",
    errNF:"\u0410\u043a\u0446\u0438\u044f \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430.",
    errLive:"\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043a\u043b\u044e\u0447 Finnhub. \u041f\u0440\u0438\u043c\u0435\u0440\u044b: AAPL MSFT NVDA.",
    riskT:"\u0423\u0420\u041e\u0412\u0415\u041d\u042c \u0420\u0418\u0421\u041a\u0410", riskTag:"\u043c\u043e\u0434\u0435\u043b\u044c 15 \u0432\u043e\u043f\u0440\u043e\u0441\u043e\u0432",
    noQ:(n)=>`${n} \u043e\u0442\u0432\u0435\u0442\u043e\u0432 "\u043d\u0435\u0442"`, showQ:"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c 15 \u0432\u043e\u043f\u0440\u043e\u0441\u043e\u0432 \u25bc", hideQ:"\u0421\u043a\u0440\u044b\u0442\u044c \u25b2",
    fundT:"\u0424\u0423\u041d\u0414\u0410\u041c\u0415\u041d\u0422\u0410\u041b \u2014 5 \u041a\u0410\u0422\u0415\u0413\u041e\u0420\u0418\u0418", sample:"\u043f\u0440\u0438\u043c\u0435\u0440",
    note:"\u0414\u0430\u043d\u043d\u044b\u0435: stockanalysis.com \u00b7 \u041c\u0435\u0442\u043e\u0434\u043e\u043b\u043e\u0433\u0438\u044f Savura Invest",
    rI:"\u041f\u043e\u043b\u043e\u0436\u0438\u0442.", rO:"\u0421\u0440\u0435\u0434\u043d\u0435\u0435", rS:"\u041e\u0442\u0440\u0438\u0446.",
    lL:"\u041d\u0418\u0417\u041a\u0418\u0419", lM:"\u0421\u0420\u0415\u0414\u041d\u0418\u0419", lH:"\u0412\u042b\u0421\u041e\u041a\u0418\u0419", lVH:"\u041e\u0427\u0415\u041d\u042c \u0412\u042b\u0421\u041e\u041a\u0418\u0419",
    qa:"\u0414\u0430", qn:"\u041d\u0435\u0442",
    cats:{growth:"\u0420\u043e\u0441\u0442",valuation:"\u041e\u0446\u0435\u043d\u043a\u0430",profitability:"\u041f\u0440\u0438\u0431\u044b\u043b\u044c\u043d.",health:"\u0424\u0438\u043d. \u0437\u0434\u043e\u0440.",efficiency:"\u042d\u0444\u0444\u0435\u043a\u0442."},
    tf:{badge:"\u0418\u041d\u0421\u0422\u0420\u0423\u041c\u0415\u041d\u0422 \u0424\u0410",h1:"\u0424\u0443\u043d\u0434. \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435",h2:"\u0430\u043a\u0446\u0438\u0438?",
      sub2:"\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0442\u0438\u043a\u0435\u0440, \u0437\u0430\u0442\u0435\u043c \u0434\u0430\u043d\u043d\u044b\u0435 \u0441 stockanalysis.com.",
      nextBtn:"\u0414\u0430\u043b\u0435\u0435",sampleNote:"\u041e\u0431\u0440\u0430\u0437\u0446\u044b: \u0434\u0430\u043d\u043d\u044b\u0435 \u0437\u0430\u043f\u043e\u043b\u043d\u044f\u0442\u0441\u044f.",
      backBtn:"\u041d\u0430\u0437\u0430\u0434",manualBadge:"\u0420\u0423\u0427\u041d\u041e\u0419 \u0412\u0412\u041e\u0414",autoLabel:"\u0410\u0432\u0442\u043e",
      instrText:"stockanalysis.com \u2192 Statistics",
      grp:["\u0420\u043e\u0441\u0442","\u041e\u0446\u0435\u043d\u043a\u0430","\u041f\u0440\u0438\u0431\u044b\u043b\u044c\u043d\u043e\u0441\u0442\u044c","\u0424\u0438\u043d. \u0437\u0434\u043e\u0440\u043e\u0432\u044c\u0435","\u042d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c","\u0420\u044b\u043d\u043e\u043a"],
      compInfo:"\u041a\u041e\u041c\u041f\u0410\u041d\u0418\u042f",boolSec:"\u0414\u043e\u043f. \u0432\u043e\u043f\u0440\u043e\u0441\u044b",
      boolSub:"\u041e\u0442\u0432\u0435\u0442\u044c\u0442\u0435 \u043d\u0430 \u0432\u043e\u043f\u0440\u043e\u0441\u044b",
      aiBtn:"AI Prompt",aiInstr:"\u0421\u043a\u043e\u043f\u0438\u0440\u0443\u0439\u0442\u0435, \u043e\u0442\u043f\u0440\u0430\u0432\u044c\u0442\u0435 \u0432 Claude.ai",
      aiCopy:"\u041a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c",aiCopied:"\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u043e!",
      analyzeBtn:"\u0410\u043d\u0430\u043b\u0438\u0437 - 15 \u0432\u043e\u043f\u0440\u043e\u0441\u043e\u0432",analyzeNote:"15 \u0432\u043e\u043f\u0440\u043e\u0441\u043e\u0432",
      reEnter:"\u0417\u0430\u043d\u043e\u0432\u043e",
      boolLbl:["\u041f\u0440\u0438\u0431\u044b\u043b\u044c\u043d\u0430?","\u041e\u0427\u041f +?","\u0417\u0430\u0449\u0438\u0442\u043d\u044b\u0439?","\u0422\u043e\u043f-10?","\u041d\u0435\u0442 \u043f\u0440\u043e\u0431\u043b\u0435\u043c?","\u041e\u043f\u0435\u0440\u0435\u0434\u0438\u043b\u0430?"],
      boolHint:["NM>0","OCF>0","\u0417\u0434\u0440\u0430\u0432\u043e/\u041a\u043e\u043c/\u0422\u043e\u0432\u0430\u0440\u044b/\u042d\u043d\u0435\u0440\u0433.","\u041f\u043e \u043a\u0430\u043f.","\u041d\u0435\u0442 \u0448\u0442\u0440.","5Y"]},
    rq:["\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438 \u0444\u0438\u043d. \u0437\u0434\u043e\u0440\u043e\u0432\u044c\u044f \u0441\u0440. \u0443\u0440\u043e\u0432\u043d\u044f \u0438\u043b\u0438 \u0432\u044b\u0448\u0435?","\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438 \u0440\u0435\u043d\u0442\u0430\u0431\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u0438 \u0441\u0440. \u0443\u0440. \u0438\u043b\u0438 \u0432\u044b\u0448\u0435?","\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438 \u044d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0438 \u0441\u0440. \u0443\u0440. \u0438\u043b\u0438 \u0432\u044b\u0448\u0435?","\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438 \u0440\u043e\u0441\u0442\u0430 \u0441\u0440. \u0443\u0440. \u0438\u043b\u0438 \u0432\u044b\u0448\u0435?","P/E \u0431\u043b\u0438\u0437\u043a\u043e \u043a \u0441\u0440\u0435\u0434\u043d\u0435\u0440\u044b\u043d\u043e\u0447\u043d\u043e\u043c\u0443 \u0438\u043b\u0438 \u043d\u0438\u0436\u0435?","\u0411\u044b\u043b\u0430 \u043f\u0440\u0438\u0431\u044b\u043b\u044c\u043d\u043e\u0439 \u0432 \u043f\u0440\u043e\u0448\u043b\u043e\u043c \u0433\u043e\u0434\u0443?","\u041e\u043f\u0435\u0440\u0430\u0446\u0438\u043e\u043d\u043d\u044b\u0439 \u0434\u0435\u043d. \u043f\u043e\u0442\u043e\u043a \u043f\u043e\u043b\u043e\u0436\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439?","\u0411\u0435\u0442\u0430 \u043c\u0435\u043d\u044c\u0448\u0435 1.5?","\u0420\u044b\u043d. \u043a\u0430\u043f. $2 \u043c\u043b\u0440\u0434 \u0438\u043b\u0438 \u0431\u043e\u043b\u044c\u0448\u0435?","\u0412 \u0437\u0430\u0449\u0438\u0442\u043d\u043e\u043c \u0441\u0435\u043a\u0442\u043e\u0440\u0435?","\u0412 \u0442\u043e\u043f-10 \u043e\u0442\u0440\u0430\u0441\u043b\u0438?","\u041d\u0435\u0442 \u0433\u0435\u043e\u043f\u043e\u043b. \u043f\u0440\u043e\u0431\u043b\u0435\u043c?","\u041e\u043f\u0435\u0440\u0435\u0434\u0438\u043b\u0430 S&P 500 \u0437\u0430 5 \u043b\u0435\u0442?","\u041d\u0435\u043e\u0436\u0438\u0434\u0430\u043d\u043d\u044b\u0435 \u0440\u0438\u0441\u043a\u0438 (\u0432\u0441\u0435\u0433\u0434\u0430 \u043d\u0435\u0442)","\u041d\u0435\u043e\u0436\u0438\u0434\u0430\u043d\u043d\u044b\u0435 \u0440\u0438\u0441\u043a\u0438 (\u0432\u0441\u0435\u0433\u0434\u0430 \u043d\u0435\u0442)"],
  },
  ar:{
    tagline:"\u062a\u062d\u0644\u064a\u0644 \u0623\u0633\u0627\u0633\u064a \u00b7 \u0633\u0648\u0642 \u0623\u0645\u0631\u064a\u0643\u0627",
    h1:"\u0645\u0627 \u0647\u0648 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0623\u0633\u0627\u0633\u064a", h2:"\u0644\u0644\u0633\u0647\u0645?",
    sub:"\u0623\u062f\u062e\u0644 \u0631\u0645\u0632 \u0627\u0644\u0633\u0647\u0645 \u2014 \u062a\u062d\u0644\u064a\u0644 \u0634\u0627\u0645\u0644.",
    ph:"\u0645\u062b\u0627\u0644: AAPL, TSLA...", btn:"\u062a\u062d\u0644\u064a\u0644", btnL:"\u062a\u062d\u0644\u064a\u0644...",
    loading:"\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a\u2026",
    errNF:"\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0633\u0647\u0645.",
    errLive:"\u0623\u0636\u0641 \u0645\u0641\u062a\u0627\u062d Finnhub. \u0623\u0645\u062b\u0644\u0629: AAPL MSFT NVDA.",
    riskT:"\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0645\u062e\u0627\u0637\u0631\u0629", riskTag:"\u0646\u0645\u0648\u0630\u062c 15 \u0633\u0624\u0627\u0644",
    noQ:(n)=>`${n} \u0625\u062c\u0627\u0628\u0629 "\u0644\u0627"`, showQ:"\u0639\u0631\u0636 15 \u0633\u0624\u0627\u0644\u0627 \u25bc", hideQ:"\u0625\u062e\u0641\u0627\u0621 \u25b2",
    fundT:"\u0627\u0644\u062a\u062d\u0644\u064a\u0644 \u2014 5 \u0641\u0626\u0627\u062a", sample:"\u0645\u062b\u0627\u0644",
    note:"\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a: stockanalysis.com \u00b7 \u0645\u0646\u0647\u062c\u064a\u0629 Savura Invest",
    rI:"\u0625\u064a\u062c\u0627\u0628\u064a", rO:"\u0645\u062a\u0648\u0633\u0637", rS:"\u0633\u0644\u0628\u064a",
    lL:"\u0645\u0646\u062e\u0641\u0636", lM:"\u0645\u062a\u0648\u0633\u0637", lH:"\u0645\u0631\u062a\u0641\u0639", lVH:"\u0645\u0631\u062a\u0641\u0639 \u062c\u062f\u0627",
    qa:"\u0646\u0639\u0645", qn:"\u0644\u0627",
    cats:{growth:"\u0627\u0644\u0646\u0645\u0648",valuation:"\u0627\u0644\u062a\u0642\u064a\u064a\u0645",profitability:"\u0627\u0644\u0631\u0628\u062d\u064a\u0629",health:"\u0627\u0644\u0635\u062d\u0629 \u0627\u0644\u0645\u0627\u0644\u064a\u0629",efficiency:"\u0627\u0644\u0643\u0641\u0627\u0621\u0629"},
    tf:{badge:"\u0623\u062f\u0627\u0629 \u062a\u062d\u0644\u064a\u0644",h1:"\u0648\u0636\u0639 \u0627\u0644\u0633\u0647\u0645",h2:"\u0627\u0644\u0623\u0633\u0627\u0633\u064a?",
      sub2:"\u0623\u062f\u062e\u0644 \u0627\u0644\u0631\u0645\u0632, \u062b\u0645 \u0623\u062f\u062e\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0645\u0646 stockanalysis.com",
      nextBtn:"\u0627\u0644\u062a\u0627\u0644\u064a",sampleNote:"\u0627\u0636\u063a\u0637 \u0644\u0645\u0644\u0621 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a.",
      backBtn:"\u0631\u062c\u0648\u0639",manualBadge:"\u064a\u062f\u0648\u064a",autoLabel:"\u062a\u0644\u0642\u0627\u0626\u064a",
      instrText:"stockanalysis.com Statistics",
      grp:["\u0627\u0644\u0646\u0645\u0648","\u0627\u0644\u062a\u0642\u064a\u064a\u0645","\u0627\u0644\u0631\u0628\u062d\u064a\u0629","\u0627\u0644\u0635\u062d\u0629 \u0627\u0644\u0645\u0627\u0644\u064a\u0629","\u0627\u0644\u0643\u0641\u0627\u0621\u0629","\u0627\u0644\u0633\u0648\u0642"],
      compInfo:"\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0634\u0631\u0643\u0629",boolSec:"\u0623\u0633\u0626\u0644\u0629",
      boolSub:"\u0623\u062c\u0628",
      aiBtn:"AI Prompt",aiInstr:"Claude.ai",
      aiCopy:"\u0646\u0633\u062e",aiCopied:"\u062a\u0645!",
      analyzeBtn:"\u062a\u062d\u0644\u064a\u0644 15",analyzeNote:"15 \u0633\u0624\u0627\u0644",
      reEnter:"\u0625\u0639\u0627\u062f\u0629",
      boolLbl:["\u0631\u0628\u062d\u062a?","\u062a\u062f\u0641\u0642?","\u062f\u0641\u0627\u0639\u064a?","\u0623\u0641\u0636\u0644 10?","\u0644\u0627 \u0645\u0634\u0627\u0643\u0644?","\u062a\u0641\u0648\u0642\u062a?"],
      boolHint:["NM>0","OCF>0","\u0635\u062d\u0629/\u0645\u0631\u0627\u0641\u0642/\u0633\u0644\u0639/\u0637\u0627\u0642\u0629","\u062d\u0633\u0628 \u0627\u0644\u0642.","\u0644\u0627 \u063a\u0631\u0627\u0645\u0627\u062a","5Y"]},
    rq:["\u0645\u0624\u0634\u0631\u0627\u062a \u0627\u0644\u0635\u062d\u0629 \u0627\u0644\u0645\u0627\u0644\u064a\u0629 \u0645\u062a\u0648\u0633\u0637\u0629 \u0623\u0648 \u0623\u0639\u0644\u0649?","\u0645\u0624\u0634\u0631\u0627\u062a \u0627\u0644\u0631\u0628\u062d\u064a\u0629 \u0645\u062a\u0648\u0633\u0637\u0629 \u0623\u0648 \u0623\u0639\u0644\u0649?","\u0645\u0624\u0634\u0631\u0627\u062a \u0627\u0644\u0643\u0641\u0627\u0621\u0629 \u0645\u062a\u0648\u0633\u0637\u0629 \u0623\u0648 \u0623\u0639\u0644\u0649?","\u0645\u0624\u0634\u0631\u0627\u062a \u0627\u0644\u0646\u0645\u0648 \u0645\u062a\u0648\u0633\u0637\u0629 \u0623\u0648 \u0623\u0639\u0644\u0649?","P/E \u0642\u0631\u064a\u0628 \u0645\u0646 \u0645\u062a\u0648\u0633\u0637 \u0627\u0644\u0633\u0648\u0642?","\u0643\u0627\u0646\u062a \u0631\u0627\u0628\u062d\u0629 \u0627\u0644\u0639\u0627\u0645 \u0627\u0644\u0645\u0627\u0636\u064a?","\u062a\u062f\u0641\u0642 \u0646\u0642\u062f\u064a \u062a\u0634\u063a\u064a\u0644\u064a \u0625\u064a\u062c\u0627\u0628\u064a?","\u0628\u064a\u062a\u0627 \u0623\u0642\u0644 \u0645\u0646 1.5?","\u0642\u064a\u0645\u0629 \u0633\u0648\u0642\u064a\u0629 $2 \u0645\u0644\u064a\u0627\u0631 \u0623\u0648 \u0623\u0643\u062b\u0631?","\u0641\u064a \u0642\u0637\u0627\u0639 \u062f\u0641\u0627\u0639\u064a?","\u0636\u0645\u0646 \u0623\u0641\u0636\u0644 10?","\u0644\u0627 \u0645\u0634\u0627\u0643\u0644 \u0642\u0627\u0646\u0648\u0646\u064a\u0629?","\u062a\u0641\u0648\u0642\u062a \u0639\u0644\u0649 S&P 500?","\u0645\u062e\u0627\u0637\u0631 \u063a\u064a\u0631 \u0645\u062a\u0648\u0642\u0639\u0629 (\u062f\u0627\u0626\u0645\u0627 \u0644\u0627)","\u0645\u062e\u0627\u0637\u0631 \u063a\u064a\u0631 \u0645\u062a\u0648\u0642\u0639\u0629 (\u062f\u0627\u0626\u0645\u0627 \u0644\u0627)"],
  },

};

const SITE_T={
  uz:{nav:{home:"Bosh sahifa",tool:"Fundamental Tahlil",course:"Aksiyalar savdosi kursi",journal:"Kundalik",demo:"Demo",about:"Biz haqimizda",erp:"Savura ERP"},
    hero:{badge:"AQSh BIRJASI · FUNDAMENTAL TAHLIL",h1:"Aksiya bozorida",h2:"ongli investitsiya",
      desc:"AQSh aksiya bozorida fundamental tahlil va halol investitsiya bo’yicha O‘zbekistonning yetakchi platformasi.",
      btn1:"Tahlilni boshlash →",btn2:"Kursni ko‘rish",
      stats:[["100+","AQSh aksiyasi"],["5","Tahlil toifasi"],["15","Savol risk modeli"],["2020","Yildan buyon"]]},
    feat:{label:"XIZMATLAR",title:"Savura Invest imkoniyatlari",
      ct:["Fundamental Tahlil","Risk Darajasi","100+ AQSh Aksiyasi","Aksiyalar savdosi kursi","Telegram Kanal","Instagram","Savura ERP"]},
    about:{label:"BIZ HAQIMIZDA",title:"Savura Invest",
      desc:"AQSh aksiya bozorida fundamental tahlil va halol investitsiya bo’yicha O‘zbekistonning yetakchi platformasi.",
      ml:"MISSIYA",mt:"Ongli investitsiya",
      mb1:"Savura Invest 2020-yildan buyon O‘zbekistonlik investorlar uchun AQSh aksiya bozorida to‘g‘ri va halol investitsiya qarorlarini qabul qilishda yordam berib kelmoqda.",
      mb2:"Biz professional metodologiyani raqamli vositaga aylantirib, har bir investor uchun qulay va tushunarli qildik.",
      fl:"ASOSCHI",fr:"Asoschi & Aksiya bozori tahlilchisi",
      fb:["2020-yildan buyon aksiyalar va treyding bilan shugʼullanadi","Turkiyada iqtisod sohasida taʼlim olmoqda","Savura brendi asoschisi","Savuraerp.com ERP sistemasi asoschisi"],
      stats:[["2020","Tashkil etilgan"],["100+","Tahlil aksiyalar"],["4","Til"],["6","Kurs moduli"]]},
    footer:{desc:"AQSh aksiya bozorida fundamental tahlil va halol investitsiya platformasi."},
    course:{label:"OʼQUV KURS",title:"Aksiyalar savdosi kursi",
      desc:"AQSh aksiya bozorida noldan sarmoya kiritishni oʼrgan. Halol investitsiya, fundamental tahlil.",
      ft:"Bu kurs siz uchun, agar...",ol:"Kurs egasi",sl:"Kurs dasturi",
      ct:"Kursga qoʻshilishga tayormisiz?",cd:"Telegram orqali murojaat qiling.",cb:"Murojaat qilish",
      mt:["Investitsiya asoslari","Aksiyalarni tanlash","Halol investitsiya","Fundamental tahlil","Risk boshqaruvi","Real amaliyot"]}},
  en:{nav:{home:"Home",tool:"Fundamental Analysis",course:"Stock Trading Course",journal:"My Space",demo:"Demo",about:"About Us",erp:"Savura ERP"},
    hero:{badge:"US MARKETS · FUNDAMENTAL ANALYSIS",h1:"Smart investing",h2:"in the stock market",
      desc:"Uzbekistan's leading platform for fundamental analysis and halal investing in US stock markets.",
      btn1:"Start Analysis →",btn2:"View Course",
      stats:[["100+","US Stocks"],["5","Categories"],["15","Risk Questions"],["2020","Since"]]},
    feat:{label:"SERVICES",title:"Savura Invest Features",
      ct:["Fundamental Analysis","Risk Assessment","100+ US Stocks","Stock Trading Course","Telegram Channel","Instagram","Savura ERP"]},
    about:{label:"ABOUT US",title:"Savura Invest",
      desc:"Uzbekistan's leading platform for fundamental analysis and halal investing in US stock markets.",
      ml:"MISSION",mt:"Conscious Investing",
      mb1:"Since 2020, Savura Invest has been helping Uzbek investors make correct and halal investment decisions in the US stock market.",
      mb2:"We transformed professional methodology into a digital tool for every investor.",
      fl:"FOUNDER",fr:"Founder & Stock Market Analyst",
      fb:["Trading stocks since 2020","Studying economics in Turkey","Founder of Savura brand","Founder of Savuraerp.com ERP system"],
      stats:[["2020","Founded"],["100+","Analyzed"],["4","Languages"],["6","Modules"]]},
    footer:{desc:"Platform for fundamental analysis and halal investing in US stock markets."},
    course:{label:"COURSE",title:"Stock Trading Course",
      desc:"Learn to invest in US stocks from scratch. Halal investing and fundamental analysis.",
      ft:"This course is for you if...",ol:"Instructor",sl:"Curriculum",
      ct:"Ready to join?",cd:"Contact us via Telegram.",cb:"Contact Us",
      mt:["Investment Basics","Selecting Stocks","Halal Investing","Fundamental Analysis","Risk Management","Real Practice"]}},
  tr:{nav:{home:"Ana Sayfa",tool:"Temel Analiz",course:"Hisse Senedi Kursu",journal:"Günlüğüm",about:"Hakkımızda",erp:"Savura ERP"},
    hero:{badge:"ABD PİYASALARI · TEMEL ANALİZ",h1:"Borsada",h2:"biliçli yatırım",
      desc:"ABD hisse senedi piyasasında temel analiz ve helal yatırım için Özbekistan’in lider platformu.",
      btn1:"Analize Başla →",btn2:"Kursu Gör",
      stats:[["100+","ABD Hissesi"],["5","Kategori"],["15","Soru"],["2020","Yılından Beri"]]},
    feat:{label:"HİZMETLER",title:"Savura Invest Özellikleri",
      ct:["Temel Analiz","Risk Değlendirmesi","100+ ABD Hissesi","Hisse Kursu","Telegram","Instagram","Savura ERP"]},
    about:{label:"HAKKIMIZDA",title:"Savura Invest",
      desc:"ABD hisse senedi piyasasında temel analiz ve helal yatırım için Özbekistan’in lider platformu.",
      ml:"MİSYON",mt:"Biliçli Yatırım",
      mb1:"Savura Invest, 2020'den bu yana Özbek yatırımcılara doğru kararlar almalarında yardımcı olmaktadır.",
      mb2:"Profesyonel metodolojiyi dijital araca dönüştürdük.",
      fl:"KURUCUSU",fr:"Kurucu & Hisse Senedi Analisti",
      fb:["2020'den bu yana hisse senetleri ile deneyimli","Türkiye'de iktisat eğitimi almaktadır","Savura markasının kurucusu","Savuraerp.com ERP sisteminin kurucusu"],
      stats:[["2020","Kuruluş"],["100+","Analiz"],["4","Dil"],["6","Modül"]]},
    footer:{desc:"ABD hisse senedi piyasasında temel analiz ve helal yatırım platformu."},
    course:{label:"EĞİTİM",title:"Hisse Senedi Ticaret Kursu",
      desc:"ABD hisse senedi piyasasına sıfırdan yatırım yapmayı öğrenin.",
      ft:"Bu kurs şunlar için...",ol:"Eğitmen",sl:"Program",
      ct:"Hazır mısınız?",cd:"Telegram üzerinden iletişime geçin.",cb:"İletişime Geç",
      mt:["Yatırım Temelleri","Hisse Seçimi","Helal Yatırım","Temel Analiz","Risk Yönetimi","Gerçek Uygulama"]}},
  ru:{nav:{home:"Главная",tool:"Фунд. анализ",course:"Курс торговли",about:"О нас",erp:"Savura ERP"},
    hero:{badge:"РЫНОК США · ФУНД. АНАЛИЗ",h1:"Осознанное инвестирование",h2:"на фондовом рынке",
      desc:"Ведущая платформа Узбекистана для фундаментального анализа и халяльного инвестирования.",
      btn1:"Начать анализ →",btn2:"Смотреть курс",
      stats:[["от 100","Акций"],["5","Категорий"],["15","Вопросов"],["2020","С года"]]},
    feat:{label:"УСЛУГИ",title:"Возможности Savura Invest",
      ct:["Фунд. анализ","Оценка рисков","100+ акций","Курс","Telegram","Instagram","Savura ERP"]},
    about:{label:"О НАС",title:"Savura Invest",
      desc:"Ведущая платформа Узбекистана для фунд. анализа.",
      ml:"МИССИЯ",mt:"Осознанное инвестирование",
      mb1:"С 2020 года Savura Invest помогает узбекским инвесторам принимать правильные решения.",
      mb2:"Мы превратили профессиональную методологию в цифровой инструмент.",
      fl:"ОСНОВАТЕЛЬ",fr:"Основатель & Аналитик",
      fb:["Торгует акциями с 2020 года","Учится на экономическом факультете в Турции","Основатель бренда Savura","Основатель Savuraerp.com ERP"],
      stats:[["2020","Основан"],["100+","Анализ"],["4","Языка"],["6","Модулей"]]},
    footer:{desc:"Платформа для фунд. анализа и халяльного инвестирования."},
    course:{label:"КУРС",title:"Курс торговли акциями",
      desc:"Научитесь инвестировать в акции США с нуля.",
      ft:"Этот курс для вас, если...",ol:"Ведущий",sl:"Программа",
      ct:"Готовы?",cd:"Свяжитесь через Telegram.",cb:"Связаться",
      mt:["Основы","Выбор акций","Халяльное","Фунд. анализ","Управление риском","Практика"]}},
  ar:{nav:{home:"الرئيسية",tool:"التحليل الأساسي",course:"دورة تداول",about:"من نحن",erp:"Savura ERP"},
    hero:{badge:"أسواق أمريكا",h1:"استثمار واع",h2:"في سوق الأسهم",
      desc:"منصة أوزبكستان للتحليل الحلال.",
      btn1:"ابدأ التحليل",btn2:"عرض الدورة",
      stats:[["+100","سهم"],["5","فئات"],["15","سؤالا"],["2020","منذ عام"]]},
    feat:{label:"الخدمات",title:"إمكانيات Savura Invest",
      ct:["تحليل أساسي","تقييم مخاطر","100+ سهم","دورة","Telegram","Instagram","Savura ERP"]},
    about:{label:"من نحن",title:"Savura Invest",desc:"منصة أوزبكستان للتحليل الحلال.",
      ml:"الرسالة",mt:"استثمار واع",mb1:"منذ 2020 نساعد المستثمرين.",mb2:"حولنا المنهجية إلى أداة رقمية.",
      fl:"المؤسس",fr:"المؤسس ومحلل",fb:["يتداول منذ 2020","يدرس في تركيا","مؤسس Savura","مؤسس Savuraerp.com"],
      stats:[["منذ 2020","تأسيس"],["+100","سهم"],["4","لغات"],["6","وحدات"]]},
    footer:{desc:"منصة للتحليل الحلال."},
    course:{label:"الدورة",title:"دورة تداول الأسهم",desc:"تعلم الاستثمار من الصفر.",
      ft:"هذه الدورة لك",ol:"مدرب",sl:"المنهج",
      ct:"هل أنت مستعد؟",cd:"تواصل عبر Telegram.",cb:"تواصل",
      mt:["أساسيات","اختيار الأسهم","التحليل الحلال","التحليل الأساسي","إدارة المخاطر","التطبيق العملي"]}}
};
function getST(lang){return SITE_T[lang]||SITE_T.uz;}

const MKEYS = {
  growth:[
    {k:"revenueGrowth",suf:"%",lbl:"Revenue Growth",r:x=>x==null?null:x>10?"I":x>=5?"O":"S"},
    {k:"epsGrowth",suf:"%",lbl:"EPS Growth",r:x=>x==null?null:x>10?"I":x>=5?"O":"S"},
  ],
  valuation:[
    {k:"pe",lbl:"P/E",r:x=>x==null?null:x<15?"I":x<=25?"O":"S"},
    {k:"ps",lbl:"P/S",r:x=>x==null?null:x<1?"I":x<=2?"O":"S"},
    {k:"pb",lbl:"P/B",r:x=>x==null?null:x<1.2?"I":x<=3?"O":"S"},
    {k:"pcf",lbl:"P/CF",r:x=>x==null?null:x<10?"I":x<=20?"O":"S"},
    {k:"peg",lbl:"PEG",r:x=>x==null?null:x<1?"I":"S"},
  ],
  profitability:[
    {k:"grossMargin",suf:"%",lbl:"Gross Margin",r:x=>x==null?null:x>40?"I":x>=30?"O":"S"},
    {k:"operatingMargin",suf:"%",lbl:"Oper. Margin",r:x=>x==null?null:x>20?"I":x>=10?"O":"S"},
    {k:"netMargin",suf:"%",lbl:"Net Margin",r:x=>x==null?null:x>15?"I":x>=5?"O":"S"},
  ],
  health:[
    {k:"currentRatio",lbl:"Current Ratio",r:x=>x==null?null:x>1.5?"I":x>=1?"O":"S"},
    {k:"quickRatio",lbl:"Quick Ratio",r:x=>x==null?null:x>1?"I":"S"},
    {k:"cashRatio",lbl:"Cash Ratio",r:x=>x==null?null:x>1?"I":x>=0.5?"O":"S"},
    {k:"debtToEquity",lbl:"Debt/Equity",r:x=>x==null?null:x<1?"I":x<=2?"O":"S"},
    {k:"debtToAssets",lbl:"Debt/Assets",r:x=>x==null?null:x<0.3?"I":x<=0.5?"O":"S"},
    {k:"interestCoverage",lbl:"Int. Coverage",r:x=>x==null?null:x>2?"I":x>=1?"O":"S"},
  ],
  efficiency:[
    {k:"roa",suf:"%",lbl:"ROA",r:x=>x==null?null:x>5?"I":x>=3?"O":"S"},
    {k:"roe",suf:"%",lbl:"ROE",r:x=>x==null?null:x>15?"I":x>=5?"O":"S"},
    {k:"roic",suf:"%",lbl:"ROIC",r:x=>x==null?null:x>10?"I":x>=2?"O":"S"},
  ],
};
const CAT_ORDER=["growth","valuation","profitability","health","efficiency"];
const DEF_KW=["birlamchi","staples","healthcare","utilities","kommunal","sog'liq","consumer staples"];

function evalFund(d,t){
  return CAT_ORDER.map(key=>{
    const items=MKEYS[key];
    const rows=items.map(it=>{
      const v=(d.fundamentals||{})[it.k];
      const rk=it.r(v);
      const disp=v==null?"---":(typeof v==="number"?v.toFixed(2).replace(/\.?0+$/,""):String(v))+(it.suf||"");
      return {label:it.lbl,value:disp,rk};
    });
    const scores=rows.map(r=>r.rk).filter(Boolean).map(rk=>rk==="I"?2:rk==="O"?1:0);
    let rating=null;
    if(scores.length){const avg=scores.reduce((a,b)=>a+b,0)/scores.length;rating=avg>=1.5?"I":avg>=0.75?"O":"S";}
    return {key,title:t.cats[key],rows,rating};
  });
}
function evalRisk(d,cats,t){
  const r=d.risk||{};
  const bk={}; cats.forEach(c=>{bk[c.key]=c.rating;});
  const ge=rk=>rk==="I"||rk==="O";
  const pe=(d.fundamentals||{}).pe;
  const sector=(d.sector||"").toLowerCase();
  const isDef=r.isDefensiveSector!=null?r.isDefensiveSector:DEF_KW.some(w=>sector.includes(w));
  const ans=[
    ge(bk.health),ge(bk.profitability),ge(bk.efficiency),ge(bk.growth),
    pe!=null&&pe<=28, r.profitableTTM===true, r.operatingCashFlowPositive===true,
    r.beta!=null&&r.beta<1.5, r.marketCap!=null&&r.marketCap>=2000,
    isDef===true, r.isIndustryLeader===true, r.freeFromLegalIssues===true,
    r.outperformedSP500_5y===true, false, false,
  ];
  const no=ans.filter(a=>!a).length;
  let level,color;
  if(no<=3){level=t.lL;color=C.green;}
  else if(no<=5){level=t.lM;color=C.amber;}
  else if(no<=9){level=t.lH;color=C.orange;}
  else{level=t.lVH;color=C.red;}
  return {level,color,noCount:no,questions:t.rq.map((q,i)=>({q,ok:ans[i]}))};
}

const FKEYS=["revenueGrowth","epsGrowth","pe","ps","pb","pcf","peg","grossMargin","operatingMargin","netMargin","currentRatio","quickRatio","cashRatio","debtToEquity","debtToAssets","interestCoverage","roa","roe","roic"];
const RKEYS=["beta","marketCap","profitableTTM","operatingCashFlowPositive","isDefensiveSector","isIndustryLeader","freeFromLegalIssues","outperformedSP500_5y"];
function mk(nm,ex,sec,ind,price,f,r){
  const fund={};FKEYS.forEach((k,i)=>fund[k]=f[i]??null);
  const risk={beta:r[0],marketCap:r[1],profitableTTM:!!r[2],operatingCashFlowPositive:!!r[3],isDefensiveSector:!!r[4],isIndustryLeader:!!r[5],freeFromLegalIssues:!!r[6],outperformedSP500_5y:!!r[7]};
  return {companyName:nm,exchange:ex,sector:sec,industry:ind,price,dataAsOf:"namuna",fundamentals:fund,risk};
}
const SAMPLE={
  AAPL:mk("Apple Inc.","NASDAQ","Technology","Consumer Electronics",195,[8,12,33,9,50,28,3,46,31,24,.9,.85,.25,1.5,.32,30,28,150,55],[1.2,3400000,1,1,0,1,1,1]),
  MSFT:mk("Microsoft Corp.","NASDAQ","Technology","Software",440,[15,18,35,12,12,30,2,69,44,36,1.3,1.2,.6,.5,.2,40,18,35,28],[.9,3300000,1,1,0,1,1,1]),
  NVDA:mk("NVIDIA Corp.","NASDAQ","Technology","Semiconductors",125,[100,120,50,30,45,50,.5,75,60,50,4,3.5,2,.2,.1,50,60,90,80],[1.7,3200000,1,1,0,1,1,1]),
  TSLA:mk("Tesla Inc.","NASDAQ","Consumer Discretionary","Automotive",250,[1,-20,70,9,12,60,5,18,8,7,1.8,1.3,.8,.2,.1,15,5,9,7],[2,1100000,1,1,0,1,0,1]),
  KO:mk("Coca-Cola Co.","NYSE","Consumer Staples","Beverages",62,[3,5,25,6,10,22,4,60,30,23,1.1,.9,.4,1.6,.45,12,10,40,15],[.6,270000,1,1,1,1,1,0]),
  JPM:mk("JPMorgan Chase","NYSE","Financials","Banking",200,[8,10,12,3.5,2,null,1.2,null,35,32,null,null,null,1.2,null,null,1.3,16,null],[1.1,580000,1,1,0,1,1,1]),
  GOOGL:mk("Alphabet Inc.","NASDAQ","Technology","Internet",165,[14,16,22,5,6,18,1.4,57,28,22,2.1,1.8,1,.1,.1,35,14,25,20],[1.1,2100000,1,1,0,1,0,1]),
  AMZN:mk("Amazon.com","NASDAQ","Consumer Discretionary","E-Commerce",190,[12,40,43,3.5,8,30,1.1,46,10,6,.9,.7,.3,.8,.25,12,4,18,15],[1.3,1900000,1,1,0,1,0,1]),
  META:mk("Meta Platforms","NASDAQ","Technology","Social Media",600,[20,35,25,7,8,20,.7,80,42,34,2.7,2.5,1.1,.2,.1,30,25,36,30],[1.3,1500000,1,1,0,1,0,1]),
  V:mk("Visa Inc.","NYSE","Financials","Payments",280,[8,10,30,14,12,25,3,78,60,52,1.4,1.2,.8,null,.1,null,25,48,40],[.9,570000,1,1,0,1,1,1]),
  MA:mk("Mastercard","NYSE","Financials","Payments",490,[10,12,36,16,56,28,3,74,58,46,1.2,1,1.1,null,.2,null,28,180,60],[.8,430000,1,1,0,1,1,1]),
  UNH:mk("UnitedHealth","NYSE","Healthcare","Managed Care",520,[9,12,20,1.2,7,15,1.6,25,8,6,1.4,1.1,.5,.7,.3,10,7,25,16],[.5,450000,1,1,1,1,1,1]),
  JNJ:mk("Johnson & Johnson","NYSE","Healthcare","Pharmaceuticals",150,[5,8,15,4,5.5,18,2,68,24,20,1.3,1,.5,null,.25,20,13,30,18],[.5,360000,1,1,1,1,0,0]),
  PFE:mk("Pfizer Inc.","NYSE","Healthcare","Pharmaceuticals",27,[-38,-70,null,3.2,2,20,null,50,5,-7,1.2,1,.3,.4,.2,3,-2,-5,null],[.5,155000,0,1,1,1,1,0]),
  ABBV:mk("AbbVie Inc.","NYSE","Healthcare","Biotechnology",190,[4,10,14,5,null,14,1.5,71,38,25,1,.8,.2,null,.3,10,12,null,20],[.5,335000,1,1,1,1,1,1]),
  WMT:mk("Walmart Inc.","NYSE","Consumer Staples","Retail",80,[5,10,33,1,6,25,3,25,4,3,1,.7,.2,.5,.35,8,7,18,14],[.5,640000,1,1,1,1,1,1]),
  PG:mk("Procter & Gamble","NYSE","Consumer Staples","Household Products",168,[3,8,26,4.5,7,20,3,50,22,18,1,.8,.2,.5,.25,20,13,34,25],[.5,390000,1,1,1,1,1,0]),
  PEP:mk("PepsiCo Inc.","NASDAQ","Consumer Staples","Beverages",150,[3,5,20,2.4,6,18,4,55,15,12,1,.8,.3,2.5,.5,8,11,48,20],[.6,200000,1,1,1,1,1,0]),
  MCD:mk("McDonald's Corp.","NYSE","Consumer Discretionary","Restaurants",300,[5,8,24,8,null,18,3,57,38,28,.9,.8,.3,null,.3,8,22,null,25],[.7,215000,1,1,0,1,1,0]),
  NFLX:mk("Netflix Inc.","NASDAQ","Consumer Discretionary","Streaming",750,[15,40,45,9,16,35,1.1,43,22,17,1,.8,.4,1.8,.4,10,12,30,25],[1.4,310000,1,1,0,1,1,1]),
  XOM:mk("ExxonMobil","NYSE","Energy","Oil & Gas",110,[1,10,14,1.6,2.2,14,1.4,40,12,8,1.5,1.2,.8,.2,.15,8,9,19,14],[.9,445000,1,1,0,1,1,0]),
  HD:mk("Home Depot","NYSE","Consumer Discretionary","Retail",370,[4,8,24,2.5,null,18,3,34,14,11,.3,.2,.1,null,.3,5,18,null,40],[1.1,360000,1,1,0,1,1,0]),
  AMD:mk("Advanced Micro Devices","NASDAQ","Technology","Semiconductors",140,[18,25,120,8,4,80,5,47,22,15,2.5,2,1.2,.4,.2,30,7,12,10],[1.8,220000,1,1,0,1,1,1]),
  AVGO:mk("Broadcom Inc.","NASDAQ","Technology","Semiconductors",240,[45,30,30,12,7,22,1.5,68,30,25,1.1,.8,.3,1.5,.3,5,13,50,25],[1.3,930000,1,1,0,1,1,1]),
  QCOM:mk("Qualcomm Inc.","NASDAQ","Technology","Semiconductors",155,[12,25,15,4,7,12,.6,56,30,24,2.8,2.3,1.5,.4,.2,12,17,44,30],[1.2,170000,1,1,0,1,1,0]),
  INTC:mk("Intel Corp.","NASDAQ","Technology","Semiconductors",22,[-8,-100,null,2.2,1.3,50,null,40,2,-2,1.5,1.2,.5,.4,.2,5,1,-3,null],[.9,95000,0,1,0,1,0,0]),
  ADBE:mk("Adobe Inc.","NASDAQ","Technology","Software",380,[10,15,45,10,12,30,3,88,34,28,1.2,1.2,.8,.2,.1,25,22,35,30],[1.1,160000,1,1,0,1,1,1]),
  CRM:mk("Salesforce Inc.","NYSE","Technology","Software",290,[9,15,50,7.5,5,40,3.5,75,18,14,1.1,.9,.3,.3,.2,8,6,8,6],[1.2,275000,1,1,0,1,1,1]),
  ORCL:mk("Oracle Corp.","NYSE","Technology","Software",180,[8,12,40,6,14,25,3.5,76,28,24,.9,.8,.2,null,.2,5,14,null,null],[.9,490000,1,1,0,1,1,1]),
  PYPL:mk("PayPal Holdings","NASDAQ","Financials","Fintech",68,[7,10,18,2.8,3,18,1.8,45,18,14,1.8,1.5,.6,null,.2,5,7,22,10],[1.8,70000,1,1,0,0,1,0]),
  "BRK.B":mk("Berkshire Hathaway B","NYSE","Financials","Diversified",455,[5,8,22,1.5,1.8,20,2.6,null,15,12,1,.8,.5,.3,.2,8,9,12,10],[.9,880000,1,1,0,1,1,1]),
  AMAT:mk("Applied Materials","NASDAQ","Technology","Semiconductor Equip.",207,[8,10,25,6,9,22,2.5,47,29,27,2.7,1.7,.5,.3,.1,35,45,30,30],[1.2,175000,1,1,0,1,1,1]),
  COHU:mk("Cohu Inc.","NASDAQ","Technology","Semiconductor Equip.",29,[-22,-100,null,2.4,1.5,null,null,47,1,-0.4,6.3,4.3,.4,.03,.1,4.5,-0.2,-0.2,-0.1],[1.5,1200,0,1,0,0,1,0]),
  TSM:mk("Taiwan Semiconductor","NYSE","Technology","Semiconductors",180,[25,30,20,7,5,18,.7,55,40,35,2.5,2,1.2,.3,.15,25,18,28,22],[.7,930000,1,1,0,1,1,1]),
  BAC:mk("Bank of America","NYSE","Financials","Banking",40,[5,8,12,3,1.1,null,1.5,null,30,25,null,null,null,1.5,null,null,1,11,null],[1.3,310000,1,1,0,1,1,0]),
  GS:mk("Goldman Sachs","NYSE","Financials","Investment Banking",520,[10,15,14,2.8,1.6,null,.9,null,18,15,null,null,null,1.2,null,null,1.2,12,null],[1.4,170000,1,1,0,1,1,1]),
  MRK:mk("Merck & Co.","NYSE","Healthcare","Pharmaceuticals",110,[7,15,13,3.5,5,15,.8,72,30,24,1.4,1,.4,.6,.25,12,14,47,30],[.4,270000,1,1,1,1,1,1]),
  CVX:mk("Chevron Corp.","NYSE","Energy","Oil & Gas",155,[1,5,14,1.8,1.8,12,2.8,32,12,10,1.5,1.2,.7,.15,.12,7,8,14,12],[.8,275000,1,1,0,1,1,0]),
  DIS:mk("The Walt Disney Co.","NYSE","Consumer Discretionary","Entertainment",97,[3,20,35,2.5,2.5,25,1.7,40,15,12,1.2,1,.4,1.1,.35,3,3,8,6],[1.3,175000,1,1,0,1,0,0]),
};
const EX=["AAPL","MSFT","NVDA","TSLA","KO","JPM"];


// ─── Icons ─────────────────────────────────────────────────────────────────
const TgIcon=({s=22})=><svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;
const IgIcon=({s=22})=><svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
const ChartIcon=({s=28})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>;
const ShieldIcon=({s=28})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const GlobeIcon=({s=28})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const BookIcon=({s=28})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
function Logo({size=42}){return(<svg width={size} height={size} viewBox="0 0 100 100" fill="none"><defs><linearGradient id="lgB" x1="20" y1="15" x2="85" y2="60" gradientUnits="userSpaceOnUse"><stop stopColor="#3461d6"/><stop offset="1" stopColor="#4aa3ff"/></linearGradient><linearGradient id="lgG" x1="30" y1="55" x2="80" y2="92" gradientUnits="userSpaceOnUse"><stop stopColor="#5fd36a"/><stop offset="1" stopColor="#2f9e44"/></linearGradient></defs><path d="M70 16 C40 16 24 30 24 47 C24 60 35 66 47 60 C36 62 33 52 41 45 C49 38 64 40 70 30 C73 24 73 18 70 16 Z" fill="url(#lgB)"/><path d="M30 84 C60 84 76 70 76 53 C76 40 65 34 53 40 C64 38 67 48 59 55 C51 62 36 60 30 70 C27 76 27 82 30 84 Z" fill="url(#lgG)"/><path d="M40 62 L62 47 L57 44 L66 40 L67 51 L62 49 L43 66 Z" fill="#4aa3ff"/></svg>);}

// ─── NavBar ─────────────────────────────────────────────────────────────────
function NavBar({page,setPage,lang,setLang}){
  const [open,setOpen]=useState(false);
  const [flagOpen,setFlagOpen]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>30);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);
  const sn=getST(lang).nav;
  const links=[{id:"home",label:sn.home},{id:"tool",label:sn.tool},{id:"course",label:sn.course},{id:"journal",label:sn.journal||"Kundalik"},{id:"about",label:sn.about},{id:"erp",label:sn.erp,ext:"https://savuraerp.com"}];
  const go=(id)=>{setPage(id);setOpen(false);setFlagOpen(false);window.scrollTo({top:0,behavior:"smooth"});};
  const LANGS=[{k:"uz",f:"🇺🇿",l:"O'Z"},{k:"en",f:"🇺🇸",l:"EN"},{k:"tr",f:"🇹🇷",l:"TR"},{k:"ru",f:"🇷🇺",l:"RU"},{k:"ar",f:"🇸🇦",l:"AR"}];
  const cur=LANGS.find(function(x){return x.k===lang;})||LANGS[0];
  return(
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:scrolled||open||flagOpen?"rgba(6,10,20,0.97)":"rgba(6,10,20,0.7)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${scrolled?C.border:"transparent"}`,transition:"background .3s"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>
        <button onClick={()=>go("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
          <Logo size={34}/>
          <div style={{textAlign:"left"}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:C.text,lineHeight:1}}>SAVURA <span style={{color:C.greenLt}}>INVEST</span></div>
            <div style={{fontSize:9,color:C.faint,letterSpacing:".5px",marginTop:2}}>AKSIYA TAHLILI</div>
          </div>
        </button>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <a href="https://t.me/savura_invest" target="_blank" rel="noreferrer" style={{color:C.dim,display:"flex",padding:"6px 8px",borderRadius:8,border:"1px solid transparent",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.color=C.blueLt;e.currentTarget.style.borderColor="rgba(74,163,255,0.3)";}} onMouseLeave={e=>{e.currentTarget.style.color=C.dim;e.currentTarget.style.borderColor="transparent";}}><TgIcon s={18}/></a>
          <a href="https://instagram.com/savura_invest" target="_blank" rel="noreferrer" style={{color:C.dim,display:"flex",padding:"6px 8px",borderRadius:8,border:"1px solid transparent",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.color="#e1306c";e.currentTarget.style.borderColor="rgba(225,48,108,0.3)";}} onMouseLeave={e=>{e.currentTarget.style.color=C.dim;e.currentTarget.style.borderColor="transparent";}}><IgIcon s={18}/></a>
          <div style={{position:"relative"}}>
            <button onClick={()=>{setFlagOpen(v=>!v);setOpen(false);}} style={{background:flagOpen?"rgba(47,125,246,0.15)":"transparent",border:`1px solid ${flagOpen?C.blueLt:C.border}`,borderRadius:8,padding:"4px 8px",cursor:"pointer",height:36,display:"flex",alignItems:"center",gap:4,fontSize:19,lineHeight:1}}>
              {cur.f}<span style={{fontSize:11,color:flagOpen?C.blueLt:C.faint,fontFamily:"'JetBrains Mono',monospace"}}>{cur.l}</span>
            </button>
            {flagOpen&&(
              <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"rgba(6,10,20,0.98)",border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",minWidth:130,boxShadow:"0 8px 32px rgba(0,0,0,0.6)",zIndex:200}}>
                {LANGS.map(function(l){return(
                  <button key={l.k} onClick={()=>{setLang(l.k);setFlagOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:lang===l.k?"rgba(47,125,246,0.1)":"transparent",border:"none",borderLeft:`3px solid ${lang===l.k?C.blue:"transparent"}`,padding:"10px 14px",cursor:"pointer",color:lang===l.k?C.blueLt:C.dim,fontFamily:"'Manrope',sans-serif",fontSize:14,fontWeight:lang===l.k?700:400,textAlign:"left"}}>
                    <span style={{fontSize:20}}>{l.f}</span><span>{l.l}</span>
                  </button>
                );})}
              </div>
            )}
          </div>
          <button onClick={()=>{setOpen(v=>!v);setFlagOpen(false);}} style={{background:"transparent",border:`1px solid ${open?C.blueLt:C.border}`,borderRadius:8,color:open?C.blueLt:C.dim,padding:"7px 10px",cursor:"pointer",display:"flex",flexDirection:"column",gap:4,alignItems:"center",justifyContent:"center",width:38,height:36}}>
            {open?<span style={{fontSize:18,lineHeight:1}}>&#x2715;</span>:<><span style={{display:"block",width:16,height:1.5,background:"currentColor",borderRadius:1}}/><span style={{display:"block",width:16,height:1.5,background:"currentColor",borderRadius:1}}/><span style={{display:"block",width:16,height:1.5,background:"currentColor",borderRadius:1}}/></>}
          </button>
        </div>
      </div>
      {open&&(
        <div style={{borderTop:`1px solid ${C.border}`,background:"rgba(6,10,20,0.98)"}}>
          {links.map(function(l){return l.ext
            ?<a key={l.id} href={l.ext} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",width:"100%",background:"transparent",borderLeft:"3px solid transparent",color:C.dim,padding:"15px 24px",fontSize:15,fontWeight:500,fontFamily:"'Manrope',sans-serif",textDecoration:"none",gap:8}}>
              <span style={{flex:1}}>{l.label}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{opacity:.4}}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            :<button key={l.id} onClick={()=>go(l.id)} style={{display:"block",width:"100%",background:page===l.id?"rgba(47,125,246,0.08)":"transparent",border:"none",borderLeft:`3px solid ${page===l.id?C.blue:"transparent"}`,color:page===l.id?C.blueLt:C.dim,padding:"15px 24px",fontSize:15,fontWeight:page===l.id?700:500,cursor:"pointer",fontFamily:"'Manrope',sans-serif",textAlign:"left"}}>{l.label}</button>;
          })}
          <div style={{display:"flex",gap:16,padding:"12px 24px 16px",borderTop:`1px solid ${C.border}`}}>
            <a href="https://t.me/savura_invest" target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:6,color:C.blueLt,fontSize:13,textDecoration:"none",fontWeight:600}}><TgIcon s={16}/> @savura_invest</a>
            <a href="https://instagram.com/savura_invest" target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:6,color:"#e1306c",fontSize:13,textDecoration:"none",fontWeight:600}}><IgIcon s={16}/> savura_invest</a>
          </div>
        </div>
      )}
    </nav>
  );
}


// ─── Finance Illustration ────────────────────────────────────────────────────
function FinanceIllustration(){
  return(
    <div style={{padding:"0 24px 20px",maxWidth:1100,margin:"0 auto"}}>
      <div style={{background:"rgba(13,22,42,0.7)",border:`1px solid rgba(74,163,255,0.12)`,borderRadius:24,overflow:"hidden",position:"relative",padding:"32px 28px"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 80% at 80% 50%,rgba(47,125,246,0.06),transparent 70%)"}}/>
        <svg width="100%" height="220" viewBox="0 0 800 220" style={{position:"relative"}}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4aa3ff" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#4aa3ff" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#52d869" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#52d869" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2f7df6"/>
              <stop offset="100%" stopColor="#52d869"/>
            </linearGradient>
          </defs>
          <style>{`
            @keyframes drawLine{from{stroke-dashoffset:600}to{stroke-dashoffset:0}}
            @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
            @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
            .chart-line{stroke-dasharray:600;animation:drawLine 2s ease forwards;}
            .fade-card{animation:fadeUp .6s ease forwards;}
            .pulse{animation:pulse 2s ease infinite;}
          `}</style>
          <polyline className="chart-line" points="20,160 80,140 140,120 200,135 260,90 320,70 380,85 440,55 500,40 560,60 620,45 680,30 740,50 780,38"
            fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <polygon points="20,160 80,140 140,120 200,135 260,90 320,70 380,85 440,55 500,40 560,60 620,45 680,30 740,50 780,38 780,200 20,200"
            fill="url(#chartGrad)" opacity="0.5"/>
          <rect x="20" y="195" width="760" height="1" fill="rgba(74,163,255,0.15)"/>
          {[80,200,320,440,560,680].map(function(x,i){return(
            <line key={i} x1={x} y1="20" x2={x} y2="200" stroke="rgba(74,163,255,0.06)" strokeWidth="1"/>
          );})}
          {[40,80,120,160].map(function(y,i){return(
            <line key={i} x1="20" y1={y} x2="780" y2={y} stroke="rgba(74,163,255,0.04)" strokeWidth="1"/>
          );})}
          <circle cx="780" cy="38" r="5" fill="#52d869" className="pulse"/>
          <circle cx="780" cy="38" r="10" fill="rgba(82,216,105,0.2)" className="pulse"/>
          <rect x="580" y="8" width="110" height="40" rx="8" fill="rgba(13,22,42,0.95)" stroke="rgba(82,216,105,0.3)" strokeWidth="1" className="fade-card" style={{animationDelay:".5s"}}/>
          <text x="592" y="22" fill="#52d869" fontSize="9" fontFamily="JetBrains Mono,monospace" fontWeight="700">NVDA</text>
          <text x="592" y="38" fill="#edf2ff" fontSize="12" fontFamily="JetBrains Mono,monospace" fontWeight="700">$875.40</text>
          <text x="660" y="22" fill="#52d869" fontSize="8" fontFamily="JetBrains Mono,monospace">+4.2%</text>
          <rect x="20" y="8" width="100" height="40" rx="8" fill="rgba(13,22,42,0.95)" stroke="rgba(74,163,255,0.3)" strokeWidth="1" className="fade-card"/>
          <text x="32" y="22" fill="#4aa3ff" fontSize="9" fontFamily="JetBrains Mono,monospace" fontWeight="700">AAPL</text>
          <text x="32" y="38" fill="#edf2ff" fontSize="12" fontFamily="JetBrains Mono,monospace" fontWeight="700">$189.25</text>
          <rect x="280" y="30" width="100" height="40" rx="8" fill="rgba(13,22,42,0.95)" stroke="rgba(82,216,105,0.25)" strokeWidth="1" className="fade-card" style={{animationDelay:".3s"}}/>
          <text x="292" y="44" fill="#4aa3ff" fontSize="9" fontFamily="JetBrains Mono,monospace" fontWeight="700">MSFT</text>
          <text x="292" y="60" fill="#edf2ff" fontSize="12" fontFamily="JetBrains Mono,monospace" fontWeight="700">$415.30</text>
          <text x="358" y="44" fill="#52d869" fontSize="8" fontFamily="JetBrains Mono,monospace">+2.1%</text>
          <text x="30" y="185" fill="rgba(74,163,255,0.3)" fontSize="9" fontFamily="JetBrains Mono,monospace">JAN</text>
          <text x="190" y="185" fill="rgba(74,163,255,0.3)" fontSize="9" fontFamily="JetBrains Mono,monospace">MAR</text>
          <text x="360" y="185" fill="rgba(74,163,255,0.3)" fontSize="9" fontFamily="JetBrains Mono,monospace">MAY</text>
          <text x="530" y="185" fill="rgba(74,163,255,0.3)" fontSize="9" fontFamily="JetBrains Mono,monospace">AUG</text>
          <text x="690" y="185" fill="rgba(74,163,255,0.3)" fontSize="9" fontFamily="JetBrains Mono,monospace">NOV</text>
          {[{x:260,y:90},{x:440,y:55},{x:620,y:45}].map(function(p,i){return(
            <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#4aa3ff" opacity="0.8"/>
          );})}
        </svg>
        <div style={{display:"flex",gap:16,marginTop:16,flexWrap:"wrap",justifyContent:"center"}}>
          {[["P/E","18.4x","Baholanish"],["EPS Growth","+24%","O'sish"],["Gross Margin","74%","Rentabellik"],["Beta","1.12","Risk"],["ROE","38%","Samaradorlik"]].map(function(it){return(
            <div key={it[0]} style={{background:"rgba(7,11,22,0.6)",border:"1px solid rgba(74,163,255,0.1)",borderRadius:10,padding:"8px 14px",textAlign:"center",minWidth:80}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:14,color:"#4aa3ff"}}>{it[1]}</div>
              <div style={{fontSize:10,color:"rgba(141,160,196,0.7)",marginTop:2}}>{it[0]}</div>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}
// ─── Hero ───────────────────────────────────────────────────────────────────
function HeroSection({setPage,lang}){
  const sh=getST(lang).hero;
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",padding:"80px 24px 40px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 60% at 50% 40%,rgba(47,125,246,0.1),transparent 70%)"}}/>
      <div style={{position:"absolute",top:"15%",left:"0%",width:380,height:380,borderRadius:"50%",background:"rgba(47,125,246,0.05)",filter:"blur(80px)"}}/>
      <div style={{position:"absolute",bottom:"15%",right:"0%",width:320,height:320,borderRadius:"50%",background:"rgba(55,178,77,0.05)",filter:"blur(80px)"}}/>
      <div style={{position:"relative",maxWidth:700}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(47,125,246,0.08)",border:"1px solid rgba(47,125,246,0.2)",borderRadius:20,padding:"6px 16px",marginBottom:28,fontSize:11,color:C.blueLt,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"1.2px"}}>{sh.badge}</div>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:"clamp(34px,8vw,68px)",lineHeight:1.05,margin:"0 0 22px",letterSpacing:"-1.5px",color:C.text}}>
          {sh.h1}<br/>
          <span style={{background:"linear-gradient(135deg,#4aa3ff,#52d869)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{sh.h2}</span>
        </h1>
        <p style={{fontSize:"clamp(14px,2.5vw,17px)",color:C.dim,maxWidth:500,margin:"0 auto 36px",lineHeight:1.7}}>{sh.desc}</p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>setPage("tool")} style={{background:`linear-gradient(135deg,${C.blue},${C.green})`,border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:15,padding:"13px 28px",cursor:"pointer",fontFamily:"'Sora',sans-serif",boxShadow:"0 8px 28px rgba(47,125,246,0.28)"}}>{sh.btn1}</button>
          <button onClick={()=>setPage("course")} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:12,color:C.dim,fontWeight:600,fontSize:15,padding:"13px 28px",cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>{sh.btn2}</button>
          <button onClick={()=>setPage("demo")} style={{background:"transparent",border:"1px solid rgba(82,216,105,0.4)",borderRadius:12,color:C.greenLt,fontWeight:600,fontSize:15,padding:"13px 28px",cursor:"pointer",fontFamily:"'Sora',sans-serif",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:18}}>📈</span> Demo Treyding
          </button>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:32,marginTop:48,flexWrap:"wrap"}}>
          {sh.stats.map(function(it){return(
            <div key={it[1]} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:24,color:C.blueLt}}>{it[0]}</div>
              <div style={{fontSize:11,color:C.faint,marginTop:3}}>{it[1]}</div>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

// ─── Features ───────────────────────────────────────────────────────────────
function FeaturesSection({setPage,lang}){
  const sf=getST(lang).feat;
  const cards=[
    {Icon:ChartIcon,title:"Fundamental Tahlil",desc:"5 toifa: O'sish, Baholanish, Rentabellik, Moliyaviy sog'lomlik, Samaradorlik. Professional metodologiya asosida.",color:C.blue,action:()=>setPage("tool")},
    {Icon:ShieldIcon,title:"Risk Darajasi",desc:"15 savollik professional risk modeli. PAST dan JUDA YUQORI gacha aniq baho. Har bir savol izohlanadi.",color:C.amber,action:()=>setPage("tool")},
    {Icon:GlobeIcon,title:"100+ AQSh Aksiyasi",desc:"AQSh birjasining asosiy kompaniyalari — AAPL, NVDA, TSLA va ko'plab boshqalar. Real vaqt ma'lumot.",color:C.green,action:()=>setPage("tool")},
    {Icon:BookIcon,title:"Aksiyalar savdosi kursi",desc:"Noldan boshlash uchun to'liq amaliy kurs. Halol investitsiya, fundamental tahlil va risk boshqaruvi.",color:"#8b5cf6",action:()=>setPage("course")},
    {Icon:TgIcon,title:"Telegram Kanal",desc:"Savura Invest kanalida yangiliklar, tahlillar va investitsiya bo'yicha dolzarb ma'lumotlar.",color:C.blueLt,action:()=>window.open("https://t.me/savura_invest","_blank")},
    {Icon:IgIcon,title:"Instagram",desc:"Visual tahlillar, grafiklar va investitsiya bo'yicha foydali educational kontentlar.",color:"#e1306c",action:()=>window.open("https://instagram.com/savura_invest","_blank")},
    {Icon:GlobeIcon,title:"Savura ERP",desc:"Savura brendi tomonidan ishlab chiqilgan ERP tizimi — korxona resurslarini boshqarish platformasi.",color:C.greenLt,action:()=>window.open("https://savuraerp.com","_blank")},
  ];
  return(
    <div style={{padding:"60px 24px 80px",maxWidth:1100,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{fontSize:10.5,letterSpacing:"2px",color:C.faint,fontFamily:"'JetBrains Mono',monospace",marginBottom:10}}>{sf.label}</div>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:"clamp(24px,4vw,38px)",margin:0,color:C.text}}>{sf.title}</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:16}}>
        {cards.map(function({Icon,title,desc,color,action},i){return(
          <button key={i} onClick={action}
            style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:22,textAlign:"left",cursor:"pointer",transition:"all .25s",position:"relative",overflow:"hidden"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=color+"66";e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="none";}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:color,opacity:.7}}/>
            <div style={{color:color,marginBottom:12}}><Icon s={26}/></div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:C.text,marginBottom:7}}>{(sf.ct&&sf.ct[i])||title}</div>
            <div style={{fontSize:13,color:C.dim,lineHeight:1.6}}>{desc}</div>
          </button>
        );})}
      </div>
    </div>
  );
}

// ─── CoursePage ─────────────────────────────────────────────────────────────
function CoursePage({lang}){
  const sc=getST(lang).course;
  const sa=getST(lang).about;
  const modules=[
    {title:"Investitsiya asoslari",desc:"Aksiya bozori nima, qanday ishlaydi. AQSh birjasi, kompaniyalar, aktsiyalar turlari.",lessons:["Aksiya bozorga kirish","Qancha daromad ko'rish mumkin","Bozor mexanizmlari","Asosiy investitsion strategiyalar","Moliyaviy mustaqillikka yo'l"]},
    {title:"Aksiyalarni tanlash",desc:"Qaysi aksiyani sotib olish kerak. Kompaniyani qanday baholash kerak. Sektor va sanoat tahlili.",lessons:["Kompaniya tahlili usullari","Sektor tahlili (GICS)","Himoyachi vs davriy sektorlar","Raqobatchilar tahlili","Top aksiyalar qanday topiladi"]},
    {title:"Halol investitsiya",desc:"Shariat mezonlariga mos aksiyalarni aniqlash. AAOIFI standartlari. Halol skrining metodologiyasi.",lessons:["Shariat skriningi nima","Biznes faoliyati tekshiruvi","Moliyaviy nisbatlar","Nopok daromad tozalash","Amaliy misollar"]},
    {title:"Fundamental tahlil",desc:"5 toifa bo'yicha chuqur tahlil: O'sish, Baholanish, Rentabellik, Moliyaviy sog'lomlik, Samaradorlik.",lessons:["O'sish: Daromad va EPS o'sishi","Baholanish: P/E, P/S, P/B, PEG","Rentabellik: Gross, Oper, Net marja","Moliyaviy sog'lomlik: Nisbatlar","Samaradorlik: ROA, ROE, ROIC"]},
    {title:"Risk boshqaruvi",desc:"15 savolli risk modeli. Portfelni diversifikatsiya qilish. Beta, volatillik va xavfni baholash.",lessons:["15 savolli risk modeli","PAST/O'RTA/YUQORI/JUDA YUQORI","Portfel diversifikatsiyasi","Beta va volatillik","Stop-loss strategiyalari"]},
    {title:"Real amaliyot",desc:"Haqiqiy akkauntni ochish. Birinchi aksiyani sotib olish. Portfelni monitoring qilish.",lessons:["Broker tanlash va akkaunt ochish","Birinchi aksiyani sotib olish","Portfelni monitoring","Hisobot o'qish","Uzoq muddatli strategiya"]},
  ];
  const forItems=["Halol aksiyalarga investitsiya qilib, boylik orttirishni xohlasangiz","Moliyaviy savodxonligingizni oshirib, aksiya bozorini mukammal o'rganmoqchi bo'lsangiz","Oylik maoshga bog'lanmagan passiv daromad manbaiga ega bo'lishni istasangiz","Pulingiz siz uchun ishlashini xohlasangiz","Muvaffaqiyatli va ongli investitsiya strategiyalarini o'rganishni xohlasangiz"];
  return(
    <div style={{paddingTop:80,minHeight:"100vh"}}>
      <div style={{background:"linear-gradient(160deg,rgba(6,10,20,1) 0%,rgba(11,22,40,1) 100%)",padding:"60px 24px 50px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:800,margin:"0 auto"}}>
          <div style={{fontSize:10.5,letterSpacing:"2px",color:C.faint,fontFamily:"'JetBrains Mono',monospace",marginBottom:12}}>{sc.label}</div>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:"clamp(26px,5vw,46px)",color:C.text,margin:"0 0 18px",lineHeight:1.1}}>{sc.title}</h1>
          <p style={{fontSize:16,color:C.dim,lineHeight:1.7,maxWidth:580,marginBottom:28}}>{sc.desc}</p>
          <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:32}}>
            {[["6",sc.sl],["30+","Dars"],["100+","Aksiya"],["Video","Darslik"]].map(function(it){return(
              <div key={it[1]} style={{background:"rgba(47,125,246,0.08)",border:"1px solid rgba(47,125,246,0.18)",borderRadius:10,padding:"10px 16px",textAlign:"center"}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:18,color:C.blueLt}}>{it[0]}</div>
                <div style={{fontSize:11,color:C.faint,marginTop:2}}>{it[1]}</div>
              </div>
            );})}
          </div>
          <a href="https://t.me/savura_invest" target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,background:`linear-gradient(135deg,${C.blue},${C.green})`,borderRadius:12,color:"#fff",fontWeight:700,fontSize:15,padding:"13px 26px",textDecoration:"none",boxShadow:"0 8px 28px rgba(47,125,246,0.28)"}}>
            <TgIcon s={18}/> {sc.cb}
          </a>
        </div>
      </div>
      <div style={{maxWidth:900,margin:"0 auto",padding:"40px 24px"}}>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,color:C.text,marginBottom:16}}>{sc.ft}</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12,marginBottom:44}}>
          {forItems.map(function(t,i){return(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px"}}>
              <span style={{color:C.greenLt,fontSize:16,flexShrink:0,marginTop:1}}>&#10003;</span>
              <span style={{fontSize:13.5,color:C.dim,lineHeight:1.5}}>{t}</span>
            </div>
          );})}
        </div>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,color:C.text,marginBottom:20}}>{sc.ol}</h2>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"24px",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start",position:"relative",overflow:"hidden",marginBottom:44}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${C.blue},${C.green})`}}/>
          <div style={{width:72,height:72,borderRadius:"50%",overflow:"hidden",border:"2px solid rgba(47,125,246,0.4)",flexShrink:0}}>
            <img src={FOUNDER_PHOTO} alt="Bahromaliyev Muhammadyusuf" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}}/>
          </div>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:19,color:C.text,marginBottom:4}}>Bahromaliyev Muhammadyusuf</div>
            <div style={{fontSize:12.5,color:C.blueLt,marginBottom:14,fontWeight:600}}>{sa.fr}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {sa.fb.map(function(t,i){return(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{color:C.green,flexShrink:0,marginTop:2,fontSize:13}}>&#8227;</span>
                  <span style={{fontSize:13.5,color:C.dim,lineHeight:1.5}}>{t}</span>
                </div>
              );})}
            </div>
            <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
              <a href="https://t.me/savura_invest" target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(47,125,246,0.1)",border:"1px solid rgba(47,125,246,0.2)",borderRadius:8,padding:"7px 12px",color:C.blueLt,fontSize:12.5,textDecoration:"none",fontWeight:600}}><TgIcon s={14}/> Telegram</a>
              <a href="https://instagram.com/savura_invest" target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(225,48,108,0.08)",border:"1px solid rgba(225,48,108,0.2)",borderRadius:8,padding:"7px 12px",color:"#e1306c",fontSize:12.5,textDecoration:"none",fontWeight:600}}><IgIcon s={14}/> Instagram</a>
              <a href="https://savuraerp.com" target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(55,178,77,0.08)",border:"1px solid rgba(55,178,77,0.2)",borderRadius:8,padding:"7px 12px",color:C.greenLt,fontSize:12.5,textDecoration:"none",fontWeight:600}}><GlobeIcon s={14}/> savuraerp.com</a>
            </div>
          </div>
        </div>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,color:C.text,marginBottom:18}}>{sc.sl}</h2>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {modules.map(function(m,i){return(
            <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px 18px"}}>
                <div style={{flexShrink:0,width:28,display:"flex",alignItems:"center",justifyContent:"center",marginTop:2,opacity:.55}}><Logo size={20}/></div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:C.text,marginBottom:6}}>{(sc.mt&&sc.mt[i])||m.title}</div>
                  <div style={{fontSize:12.5,color:C.dim,lineHeight:1.6,marginBottom:10}}>{m.desc}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {m.lessons.map(function(l,j){return(
                      <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                        <span style={{color:C.greenLt,fontSize:10,flexShrink:0,marginTop:3}}>&#9654;</span>
                        <span style={{fontSize:12.5,color:C.faint,lineHeight:1.5}}>{l}</span>
                      </div>
                    );})}
                  </div>
                </div>
              </div>
            </div>
          );})}
        </div>
        <div style={{marginTop:40,textAlign:"center",background:`linear-gradient(135deg,rgba(47,125,246,0.08),rgba(55,178,77,0.08))`,border:`1px solid ${C.border}`,borderRadius:18,padding:"32px 24px"}}>
          <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:C.text,marginBottom:8}}>{sc.ct}</h3>
          <p style={{color:C.dim,fontSize:14,marginBottom:22}}>{sc.cd}</p>
          <a href="https://t.me/savura_invest" target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,background:`linear-gradient(135deg,${C.blue},${C.green})`,borderRadius:12,color:"#fff",fontWeight:700,fontSize:15,padding:"13px 26px",textDecoration:"none",boxShadow:"0 8px 28px rgba(47,125,246,0.28)"}}>
            <TgIcon s={18}/> {sc.cb}
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── AboutPage ───────────────────────────────────────────────────────────────
function AboutPage({lang}){
  const sa=getST(lang).about;
  return(
    <div style={{padding:"90px 24px 80px",maxWidth:900,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:50}}>
        <div style={{fontSize:10.5,letterSpacing:"2px",color:C.faint,fontFamily:"'JetBrains Mono',monospace",marginBottom:12}}>{sa.label}</div>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:"clamp(26px,5vw,48px)",margin:"0 0 18px",color:C.text}}>{sa.title}</h1>
        <p style={{fontSize:16,color:C.dim,maxWidth:520,margin:"0 auto",lineHeight:1.7}}>{sa.desc}</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:20,marginBottom:40}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:28}}>
          <div style={{fontSize:10.5,letterSpacing:"2px",color:C.faint,fontFamily:"'JetBrains Mono',monospace",marginBottom:14}}>{sa.ml}</div>
          <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:C.text,margin:"0 0 14px"}}>{sa.mt}</h3>
          <p style={{color:C.dim,lineHeight:1.8,margin:0,fontSize:14}}>{sa.mb1}</p>
          <p style={{color:C.dim,lineHeight:1.8,marginTop:10,fontSize:14}}>{sa.mb2}</p>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:28,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${C.blue},${C.green})`}}/>
          <div style={{fontSize:10.5,letterSpacing:"2px",color:C.faint,fontFamily:"'JetBrains Mono',monospace",marginBottom:14}}>{sa.fl}</div>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
            <div style={{width:52,height:52,borderRadius:"50%",overflow:"hidden",border:"2px solid rgba(47,125,246,0.35)",flexShrink:0}}>
              <img src={FOUNDER_PHOTO} alt="Bahromaliyev Muhammadyusuf" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}}/>
            </div>
            <div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:C.text}}>Bahromaliyev Muhammadyusuf</div>
              <div style={{fontSize:12,color:C.faint,marginTop:2}}>{sa.fr}</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {sa.fb.map(function(t,i){return(
              <div key={i} style={{display:"flex",gap:8,fontSize:13,color:C.dim}}>
                <span style={{color:C.green,flexShrink:0}}>&#8227;</span>{t}
              </div>
            );})}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14}}>
        {sa.stats.map(function(it){return(
          <div key={it[1]} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px",textAlign:"center"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:26,color:C.blueLt}}>{it[0]}</div>
            <div style={{fontSize:12,color:C.faint,marginTop:5}}>{it[1]}</div>
          </div>
        );})}
      </div>
    </div>
  );
}


// ─── BoolSection component ───────────────────────────────────────────────────
function BoolSection({ticker, bools, setBools, t}){
  const [copied, setCopied] = useState(false);
  const [showP, setShowP] = useState(false);
  const sampleEntry = SAMPLE[ticker] || {};
  const cn = sampleEntry.companyName || ticker;
  const today = new Date().toISOString().split("T")[0];

  function buildPrompt(){
    return (
      "Siz moliyaviy tahlilchi sifatida " + cn + " (" + ticker + ") aksiyasi haqida " +
      "HOZIRGI eng so'nggi real ma'lumotlar asosida quyidagi savollarga javob bering.\n" +
      "Sana: " + today + "\n\n" +
      "MUHIM: Faqat eng oxirgi kvartal/yillik hisobotlar asosida javob bering.\n\n" +
      "Har bir savolga Ha yoki Yoq deb javob bering va 1-2 jumlada izoh qoshshing:\n\n" +
      "1. " + cn + " (" + ticker + ") otgan 12 oyda (TTM) foydali boldimi? Net Margin noldan kattami?\n" +
      "2. " + cn + " (" + ticker + ") operatsion pul oqimi hozir musbatmi? Operating Cash Flow musbatmi?\n" +
      "3. " + cn + " (" + ticker + ") himoya qiluvchi sektordami? FAQAT: Healthcare, Utilities, Consumer Staples yoki Energy sektorida?\n" +
      "4. " + cn + " (" + ticker + ") oz sanoatida hozir bozor kapitalizatsiyasi boyicha top-10 ichidami?\n" +
      "5. " + cn + " (" + ticker + ") da hozir yirik yuridik muammo yoqmi? SEC ishi, katta jarima yoki faol sud jarayoni yoqmi?\n" +
      "6. " + cn + " (" + ticker + ") songgi 5 yilda SP 500 dan ustun keldimi? 5-yillik umumiy daromad SP 500 dan yuqorimi?"
    );
  }

  function copyPrompt(){
    var txt = buildPrompt();
    if(navigator.clipboard){
      navigator.clipboard.writeText(txt).then(function(){
        setCopied(true);
        setTimeout(function(){ setCopied(false); }, 2500);
      });
    }
  }

  return(
    <div style={{background:C.card, border:"1px solid " + C.border, borderRadius:14, padding:"16px 18px", marginBottom:20}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, flexWrap:"wrap", gap:8}}>
        <div>
          <div style={{fontSize:12.5, fontWeight:700, color:C.text}}>{(t&&t.tf)?t.tf.boolSec:"Qo'shimcha savollar"}</div>
          <div style={{fontSize:11, color:C.faint, marginTop:2}}>{(t&&t.tf)?t.tf.boolSub:"Savollarga javob bering"}</div>
        </div>
        <button onClick={function(){setShowP(function(v){return !v;});}}
          style={{background:"rgba(74,163,255,0.1)", border:"1px solid rgba(74,163,255,0.3)", borderRadius:8, color:C.blueLt, fontSize:12, fontWeight:600, padding:"7px 12px", cursor:"pointer"}}>
          AI Prompt {showP ? "^" : "v"}
        </button>
      </div>

      {showP && (
        <div style={{background:"rgba(0,0,0,0.3)", border:"1px solid rgba(74,163,255,0.2)", borderRadius:10, padding:"12px", marginBottom:14}}>
          <div style={{fontSize:11, color:C.blueLt, fontWeight:600, marginBottom:6}}>
            Nusxa oling, Claude.ai yoki ChatGPT ga yuboring, javobga qarab katakchalarni belgilang
          </div>
          <div style={{display:"flex", gap:8, marginBottom:10, flexWrap:"wrap"}}>
            <a href="https://claude.ai" target="_blank" rel="noreferrer"
              style={{fontSize:11, color:C.dim, border:"1px solid " + C.border, borderRadius:6, padding:"4px 10px", textDecoration:"none"}}>
              claude.ai
            </a>
            <a href="https://chat.openai.com" target="_blank" rel="noreferrer"
              style={{fontSize:11, color:C.dim, border:"1px solid " + C.border, borderRadius:6, padding:"4px 10px", textDecoration:"none"}}>
              chatgpt.com
            </a>
          </div>
          <div style={{background:"rgba(0,0,0,0.25)", borderRadius:8, padding:"10px", marginBottom:10}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:C.dim, lineHeight:1.7, whiteSpace:"pre-wrap", wordBreak:"break-word"}}>
              {"Siz moliyaviy tahlilchi sifatida " + cn + " (" + ticker + ") aksiyasi haqida"}<br/>
              {"HOZIRGI eng songi real malumotlar asosida javob bering. Sana: " + today}<br/>
              <br/>
              {"1. " + cn + " (" + ticker + ") otgan 12 oyda foydali boldimi?"}<br/>
              {"2. " + cn + " (" + ticker + ") operatsion pul oqimi musbatmi?"}<br/>
              {"3. " + cn + " (" + ticker + ") himoya qiluvchi sektordami? (Healthcare/Utilities/Consumer Staples/Energy)"}<br/>
              {"4. " + cn + " (" + ticker + ") sanoatida top-10 ichidami? (bozor kap. boyicha)"}<br/>
              {"5. " + cn + " (" + ticker + ") yirik yuridik muammo yoqmi?"}<br/>
              {"6. " + cn + " (" + ticker + ") songgi 5 yilda SP500 dan ustun keldimi?"}
            </div>
          </div>
          <button onClick={copyPrompt}
            style={{background: copied ? "rgba(55,178,77,0.15)" : "rgba(47,125,246,0.1)",
              border: "1px solid " + (copied ? "rgba(55,178,77,0.4)" : "rgba(47,125,246,0.3)"),
              borderRadius:7, color: copied ? C.greenLt : C.blueLt,
              fontSize:12, fontWeight:600, padding:"7px 16px", cursor:"pointer"}}>
            {copied ? t.tf.aiCopied : t.tf.aiCopy}
          </button>
        </div>
      )}

      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:10}}>
        {BOOL_FIELDS.map(function(bf, bfi){
          var k=bf.k;
          var lbl = (t.tf && t.tf.boolLbl && t.tf.boolLbl[bfi]) ? t.tf.boolLbl[bfi] : bf.lbl;
          var hint = (t.tf && t.tf.boolHint && t.tf.boolHint[bfi]) ? t.tf.boolHint[bfi] : bf.hint;
          return(
            <div key={k}
              onClick={function(){setBools(function(b){var nb=Object.assign({},b); nb[k]=!nb[k]; return nb;});}}
              style={{display:"flex", alignItems:"flex-start", gap:12, padding:"10px 12px",
                background: bools[k] ? "rgba(55,178,77,0.04)" : "rgba(255,255,255,0.01)",
                border: "1px solid " + (bools[k] ? "rgba(55,178,77,0.35)" : C.border),
                borderRadius:10, cursor:"pointer"}}>
              <div style={{flexShrink:0, width:22, height:22, borderRadius:6,
                background: bools[k] ? C.green : "transparent",
                border: "2px solid " + (bools[k] ? C.green : C.border),
                display:"flex", alignItems:"center", justifyContent:"center", marginTop:1}}>
                {bools[k] && <span style={{color:"#fff", fontSize:13, fontWeight:700}}>v</span>}
              </div>
              <div>
                <div style={{fontSize:12.5, color: bools[k] ? C.text : C.dim, fontWeight: bools[k] ? 600 : 400, lineHeight:1.3}}>{lbl}</div>
                <div style={{fontSize:10.5, color:C.faint, marginTop:2, lineHeight:1.4}}>{hint}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ─── Fundamental Tool — Manual Input ────────────────────────────────────────
const {useState:_us, useEffect:_ue} = React;

const GROUPS = [
  {title:"O'sish",        hint:"Statistics → Growth",              cols:2, fields:[
    {k:"revenueGrowth",  lbl:"Revenue Growth",     suf:"%",  ph:"e.g. 8.3"},
    {k:"epsGrowth",      lbl:"EPS Growth",          suf:"%",  ph:"e.g. 12.5"},
  ]},
  {title:"Baholanish",    hint:"Statistics → Valuation Ratios",    cols:4, fields:[
    {k:"pe",   lbl:"P/E Ratio",   ph:"e.g. 25.4"},
    {k:"ps",   lbl:"P/S Ratio",   ph:"e.g. 5.2"},
    {k:"pb",   lbl:"P/B Ratio",   ph:"e.g. 8.1"},
    {k:"peg",  lbl:"PEG Ratio",   ph:"e.g. 1.3"},
  ]},
  {title:"Rentabellik",   hint:"Statistics → Margins",             cols:3, fields:[
    {k:"grossMargin",    lbl:"Gross Margin",     suf:"%", ph:"e.g. 48.9"},
    {k:"operatingMargin",lbl:"Operating Margin", suf:"%", ph:"e.g. 30.2"},
    {k:"netMargin",      lbl:"Profit Margin",    suf:"%", ph:"e.g. 29.3"},
  ]},
  {title:"Moliyaviy Sog'lomlik", hint:"Statistics → Financial Position", cols:4, fields:[
    {k:"currentRatio",    lbl:"Current Ratio",    ph:"e.g. 2.51"},
    {k:"quickRatio",      lbl:"Quick Ratio",       ph:"e.g. 1.62"},
    {k:"debtToEquity",    lbl:"Debt/Equity",       ph:"e.g. 0.30"},
    {k:"interestCoverage",lbl:"Interest Coverage", ph:"e.g. 31.9"},
  ]},
  {title:"Samaradorlik",  hint:"Statistics → Financial Efficiency", cols:3, fields:[
    {k:"roa",  lbl:"ROA",   suf:"%", ph:"e.g. 14.8"},
    {k:"roe",  lbl:"ROE",   suf:"%", ph:"e.g. 39.6"},
    {k:"roic", lbl:"ROIC",  suf:"%", ph:"e.g. 33.2"},
  ]},
  {title:"Bozor Ma'lumotlari", hint:"Statistics → Total Valuation & Stock Price Stats", cols:2, fields:[
    {k:"beta",       lbl:"Beta (5Y)",    ph:"e.g. 1.67"},
    {k:"marketCapB", lbl:"Market Cap",   suf:"B$", ph:"e.g. 359.67"},
  ]},
];

const BOOL_FIELDS = [
  {k:"profitableTTM",              lbl:"O'tgan yilda foydali?",          hint:"Net Margin > 0"},
  {k:"operatingCashFlowPositive",  lbl:"Operatsion pul oqimi musbat?",  hint:"Cash Flow → Operating CF > 0"},
  {k:"isDefensiveSector",          lbl:"Himoya qiluvchi sektorda?",      hint:"Healthcare / Utilities / Consumer Staples / Energy"},
  {k:"isIndustryLeader",           lbl:"Sanoatda top-10 ichida?",        hint:"Bozor kap. bo'yicha"},
  {k:"freeFromLegalIssues",        lbl:"Yirik yuridik muammo yo'q?",    hint:"Davlat jarimalari/katta ish yo'q"},
  {k:"outperformedSP500_5y",       lbl:"So'nggi 5 yilda S&P 500 dan ustun?", hint:"Chart → 5Y tabni stockanalysis.com da ko'ring"},
];

const EMPTY_VALS = {revenueGrowth:"",epsGrowth:"",pe:"",ps:"",pb:"",peg:"",grossMargin:"",operatingMargin:"",netMargin:"",currentRatio:"",quickRatio:"",debtToEquity:"",interestCoverage:"",roa:"",roe:"",roic:"",beta:"",marketCapB:""};
const EMPTY_BOOLS = {profitableTTM:true,operatingCashFlowPositive:true,isDefensiveSector:false,isIndustryLeader:false,freeFromLegalIssues:true,outperformedSP500_5y:false};

function FundamentalTool({lang, setLang}){
  const t = LANG[lang]||LANG.uz;
  const [step, setStep] = _us(0);
  const [ticker, setTicker] = _us("");
  const [vals, setVals] = _us({...EMPTY_VALS});
  const [bools, setBools] = _us({...EMPTY_BOOLS});
  const [result, setResult] = _us(null);

  const nv = v => { const x=parseFloat(v); return isNaN(x)?null:x; };
  const st = {background:"rgba(12,20,38,.85)",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"8px 10px",fontSize:13,fontFamily:"'JetBrains Mono',monospace",outline:"none",width:"100%",transition:"border .2s"};

  function loadSample(sym){
    const s=SAMPLE[sym]; if(!s)return;
    setTicker(sym);
    const f=s.fundamentals||{}, r=s.risk||{};
    const mv=k=>f[k]!=null?String(f[k]):"";
    setVals({revenueGrowth:mv("revenueGrowth"),epsGrowth:mv("epsGrowth"),pe:mv("pe"),ps:mv("ps"),pb:mv("pb"),peg:mv("peg"),grossMargin:mv("grossMargin"),operatingMargin:mv("operatingMargin"),netMargin:mv("netMargin"),currentRatio:mv("currentRatio"),quickRatio:mv("quickRatio"),debtToEquity:mv("debtToEquity"),interestCoverage:mv("interestCoverage"),roa:mv("roa"),roe:mv("roe"),roic:mv("roic"),beta:r.beta!=null?String(r.beta):"",marketCapB:r.marketCap!=null?String((r.marketCap/1000).toFixed(2)):""});
    setBools({profitableTTM:!!r.profitableTTM,operatingCashFlowPositive:!!r.operatingCashFlowPositive,isDefensiveSector:!!r.isDefensiveSector,isIndustryLeader:!!r.isIndustryLeader,freeFromLegalIssues:!!r.freeFromLegalIssues,outperformedSP500_5y:!!r.outperformedSP500_5y});
    setStep(1);
  }

  function handleAnalyze(){
    const tk=ticker.trim().toUpperCase();
    const nm=nv(vals.netMargin), om=nv(vals.operatingMargin);
    const s=SAMPLE[tk]||{}; const d={ticker:tk,companyName:s.companyName||tk,exchange:s.exchange||"",sector:s.sector||"",industry:s.industry||"",price:null,dataAsOf:new Date().toISOString().split("T")[0],_manual:true,
      fundamentals:{revenueGrowth:nv(vals.revenueGrowth),epsGrowth:nv(vals.epsGrowth),pe:nv(vals.pe),ps:nv(vals.ps),pb:nv(vals.pb),pcf:null,peg:nv(vals.peg),grossMargin:nv(vals.grossMargin),operatingMargin:om,netMargin:nm,currentRatio:nv(vals.currentRatio),quickRatio:nv(vals.quickRatio),cashRatio:null,debtToEquity:nv(vals.debtToEquity),debtToAssets:null,interestCoverage:nv(vals.interestCoverage),roa:nv(vals.roa),roe:nv(vals.roe),roic:nv(vals.roic)},
      risk:{beta:nv(vals.beta),marketCap:nv(vals.marketCapB)?nv(vals.marketCapB)*1000:null,profitableTTM:nm!=null?nm>0:bools.profitableTTM,operatingCashFlowPositive:om!=null?om>0:bools.operatingCashFlowPositive,isDefensiveSector:bools.isDefensiveSector,isIndustryLeader:bools.isIndustryLeader,freeFromLegalIssues:bools.freeFromLegalIssues,outperformedSP500_5y:bools.outperformedSP500_5y}};
    setResult(d); setStep(2);
  }

  // ── STEP 2: Results ─────────────────────────────────────────────
  if(step===2&&result) return(
    <div style={{padding:"85px 24px 60px",maxWidth:940,margin:"0 auto"}}>
      <button onClick={()=>{setResult(null);setStep(1);}} style={{background:`rgba(47,125,246,0.1)`,border:`1px solid ${C.border}`,color:C.blueLt,borderRadius:9,padding:"8px 16px",fontSize:13,cursor:"pointer",marginBottom:20,display:"inline-flex",alignItems:"center",gap:7}}>
        ← Qayta kiriting
      </button>
      <ToolResult d={result} t={t}/>
    </div>
  );

  // ── STEP 0: Ticker entry ─────────────────────────────────────────
  if(step===0) return(
    <div style={{padding:"85px 24px 60px",maxWidth:940,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:10.5,letterSpacing:"2px",color:C.faint,fontFamily:"'JetBrains Mono',monospace",marginBottom:10}}>FUNDAMENTAL TAHLIL VOSITASI</div>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:"clamp(22px,4vw,38px)",lineHeight:1.15,margin:"0 0 10px",color:C.text}}>
          Aksiyaning fundamental holati <br/>
          <span style={{background:`linear-gradient(90deg,${C.blueLt},${C.greenLt})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>qanday?</span>
        </h1>
        <p style={{color:C.dim,fontSize:14,maxWidth:480,margin:"0 auto 8px",lineHeight:1.6}}>
          Aksiya belgisini kiriting, keyin <strong style={{color:C.greenLt}}>stockanalysis.com</strong> dan ma'lumotlarni o'zingiz kiritasiz.
        </p>
        <a href="https://stockanalysis.com" target="_blank" rel="noreferrer" style={{fontSize:12,color:C.blueLt,border:`1px solid rgba(74,163,255,0.3)`,borderRadius:7,padding:"4px 10px",display:"inline-flex",alignItems:"center",gap:5}}>
          stockanalysis.com →
        </a>
      </div>
      {/* Language switcher */}
      <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:20,flexWrap:"wrap"}}>
        {[{k:"uz",l:"O'Z"},{k:"en",l:"EN"},{k:"tr",l:"TR"},{k:"ru",l:"RU"},{k:"ar",l:"AR"}].map(l=>(
          <button key={l.k} onClick={()=>setLang(l.k)} style={{background:lang===l.k?`linear-gradient(135deg,${C.blue},${C.green})`:"transparent",border:`1px solid ${lang===l.k?"transparent":C.border}`,color:lang===l.k?"#fff":C.dim,borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{l.l}</button>
        ))}
      </div>
      {/* Ticker input */}
      <div style={{display:"flex",gap:10,maxWidth:540,margin:"0 auto 16px"}}>
        <input value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())} onKeyDown={e=>{if(e.key==="Enter"&&ticker.trim()){setStep(1);setCName("");setExchange("");setSector("");setIndustry("");setVals({...EMPTY_VALS});setBools({...EMPTY_BOOLS});} }} placeholder="AAPL, MSFT, NVDA ..." style={{flex:1,background:"rgba(12,20,38,.85)",border:`1px solid ${C.border}`,borderRadius:12,color:C.text,padding:"14px 18px",fontSize:16,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"1px",outline:"none"}}/>
        <button onClick={()=>{if(ticker.trim()){setStep(1);setCName("");setExchange("");setSector("");setIndustry("");setVals({...EMPTY_VALS});setBools({...EMPTY_BOOLS});}}} style={{background:`linear-gradient(135deg,${C.blue},${C.green})`,border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:15,padding:"0 22px",cursor:"pointer",fontFamily:"'Sora',sans-serif",whiteSpace:"nowrap"}}>Keyingi →</button>
      </div>
      {/* Quick samples */}
      <div style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap",marginBottom:20}}>
        {EX.map(x=><button key={x} onClick={()=>loadSample(x)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.dim,borderRadius:20,padding:"5px 12px",fontSize:12,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}} title="Namuna ma'lumot">{x}</button>)}
      </div>
      <div style={{textAlign:"center",fontSize:11,color:C.faint,maxWidth:500,margin:"0 auto",lineHeight:1.7}}>
        Namuna tugmalarini bossangiz — o'sha aksiyaning namuna ma'lumotlari avtomatik to'ldiriladi va tahrirlashingiz mumkin.
      </div>
    </div>
  );

  // ── STEP 1: Manual input form ────────────────────────────────────
  return(
    <div style={{padding:"85px 24px 60px",maxWidth:980,margin:"0 auto"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <button onClick={()=>setStep(0)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.dim,borderRadius:8,padding:"7px 13px",fontSize:12.5,cursor:"pointer"}}>← Orqaga</button>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:22,color:C.blueLt}}>{ticker}</div>
          <div style={{fontSize:10.5,color:C.amber,border:"1px solid rgba(240,169,43,.4)",borderRadius:6,padding:"3px 8px",fontWeight:600}}>QO'LDA KIRITILADI</div>
        </div>
        <a href={`https://stockanalysis.com/stocks/${ticker.toLowerCase()}/statistics/`} target="_blank" rel="noreferrer" style={{fontSize:12,color:C.blueLt,border:`1px solid rgba(74,163,255,0.3)`,borderRadius:8,padding:"7px 12px",display:"inline-flex",alignItems:"center",gap:5}}>
          stockanalysis.com/{ticker.toLowerCase()} →
        </a>
      </div>

      {/* Instruction banner */}
      <div style={{background:`rgba(47,125,246,0.07)`,border:`1px solid rgba(47,125,246,0.2)`,borderRadius:12,padding:"12px 16px",marginBottom:24,display:"flex",alignItems:"flex-start",gap:10}}>
        <span style={{color:C.blueLt,fontSize:18,flexShrink:0}}>ℹ</span>
        <div style={{fontSize:13,color:C.dim,lineHeight:1.6}}>
          <strong style={{color:C.text}}>stockanalysis.com</strong> saytiga kiring → aksiya belgisini qidiring → <strong style={{color:C.greenLt}}>Statistics</strong> sahifasini oching. Quyidagi barcha ko'rsatkichlarni shu sahifadan ko'rib kiriting.
        </div>
      </div>

      {/* READ-ONLY Company Info */}
      {(()=>{const s=SAMPLE[ticker]||{}; const cn=s.companyName||ticker; const ex=s.exchange||""; const sc=s.sector||""; const ind=s.industry||""; return(
        <div style={{background:`rgba(47,125,246,0.05)`,border:`1px solid rgba(47,125,246,0.2)`,borderRadius:12,padding:"12px 16px",marginBottom:14,display:"flex",flexWrap:"wrap",gap:16,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:18,color:C.blueLt}}>{ticker}</span>
            {ex&&<span style={{fontSize:11,color:C.dim,border:`1px solid ${C.border}`,borderRadius:5,padding:"2px 7px"}}>{ex}</span>}
          </div>
          {cn!==ticker&&<span style={{fontSize:14,fontWeight:600,color:C.text}}>{cn}</span>}
          {sc&&<span style={{fontSize:12,color:C.dim}}>{sc}{ind&&ind!==sc?" · "+ind:""}</span>}
          <span style={{marginLeft:"auto",fontSize:10.5,color:C.faint,fontStyle:"italic"}}>Ma'lumotlar avtomatik</span>
        </div>
      );})()}

      {/* Financial metric groups */}
      {GROUPS.map(({title,hint,cols,fields},gi)=>{
        const grpT=(t.tf&&t.tf.grp&&t.tf.grp[gi])?t.tf.grp[gi]:title;
        return(
        <div key={grpT} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 18px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:6}}>
            <div style={{fontSize:12.5,fontWeight:700,color:C.text}}>{grpT}</div>
            <div style={{fontSize:10.5,color:C.faint,fontFamily:"'JetBrains Mono',monospace",background:"rgba(255,255,255,.04)",border:`1px solid ${C.border}`,borderRadius:6,padding:"2px 8px"}}>{hint}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fit,minmax(${cols>=4?"145px":"200px"},1fr))`,gap:10}}>
            {fields.map(({k,lbl,suf,ph})=>(
              <div key={k}>
                <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:10.5,color:C.dim}}>{lbl}</span>
                  {suf&&<span style={{fontSize:9.5,color:C.faint,background:"rgba(255,255,255,.05)",borderRadius:4,padding:"1px 5px"}}>{suf}</span>}
                </div>
                <input
                  value={vals[k]}
                  onChange={e=>setVals(v=>({...v,[k]:e.target.value}))}
                  placeholder={ph}
                  onFocus={e=>e.target.style.borderColor=C.blueLt}
                  onBlur={e=>e.target.style.borderColor=C.border}
                  style={{...st}}
                />
              </div>
            ))}
          </div>
        </div>
      );
      })}

      <BoolSection ticker={ticker} bools={bools} setBools={setBools} t={t}/>

      {/* Analyze button */}
      <div style={{textAlign:"center"}}>
        <button onClick={handleAnalyze} style={{background:`linear-gradient(135deg,${C.blue},${C.green})`,border:"none",borderRadius:14,color:"#fff",fontWeight:700,fontSize:17,padding:"16px 48px",cursor:"pointer",fontFamily:"'Sora',sans-serif",boxShadow:`0 8px 28px rgba(47,125,246,0.28)`,letterSpacing:".5px"}}>
          Tahlil Qilish — 15 Savol →
        </button>
        <div style={{fontSize:11,color:C.faint,marginTop:10}}>Kiritilgan ma'lumotlar asosida 15 savolga avtomatik javob beriladi va risk darajasi aniqlanadi</div>
      </div>
    </div>
  );
}

function ToolResult({d,t}){
  const cats=evalFund(d,t);
  const risk=evalRisk(d,cats,t);
  const [showQ,setShowQ]=useState(false);
  const rC=rk=>rk==="I"?C.green:rk==="O"?C.amber:rk==="S"?C.red:C.faint;
  const rL=rk=>rk==="I"?t.rI:rk==="O"?t.rO:rk==="S"?t.rS:"---";
  return(
    <div style={{marginTop:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:10,paddingBottom:14,borderBottom:`1px solid ${C.border}`,marginBottom:16}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:22,color:C.blueLt}}>{d.ticker}</span>
            {d.exchange&&<span style={{fontSize:11,color:C.dim,border:`1px solid ${C.border}`,borderRadius:6,padding:"2px 7px"}}>{d.exchange}</span>}
            {d._live&&<span style={{fontSize:10.5,color:C.greenLt,border:"1px solid rgba(82,216,105,.4)",borderRadius:6,padding:"2px 7px"}}>live</span>}
            {d._manual&&<span style={{fontSize:10.5,color:C.amber,border:"1px solid rgba(240,169,43,.4)",borderRadius:6,padding:"2px 7px"}}>qo'lda kiritilgan</span>}
            {d._sample&&!d._live&&<span style={{fontSize:10.5,color:C.amber,border:"1px solid rgba(240,169,43,.4)",borderRadius:6,padding:"2px 7px"}}>{t.sample}</span>}
          </div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,marginTop:5,color:C.text}}>{d.companyName}</div>
          {d.sector&&<div style={{fontSize:12,color:C.dim,marginTop:2}}>{d.sector}{d.industry&&d.industry!==d.sector?" · "+d.industry:""}</div>}
        </div>
        {d.price!=null&&<div style={{textAlign:"right"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:22,color:C.text}}>${Number(d.price).toFixed(2)}</div><div style={{fontSize:11,color:C.faint}}>{d.dataAsOf||""}</div></div>}
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:risk.color,opacity:.85}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:10.5,letterSpacing:"1px",color:C.dim,fontWeight:700}}>{t.riskT}</span>
          <span style={{fontSize:9,color:C.faint,border:`1px solid ${C.border}`,borderRadius:5,padding:"2px 6px"}}>{t.riskTag}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:risk.color,background:risk.color+"1f",border:`1px solid ${risk.color}55`,borderRadius:8,padding:"6px 14px"}}>{risk.level}</span>
          <span style={{color:C.dim,fontSize:12}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:risk.color,fontSize:18}}>{risk.noCount}</span> / 15 {t.qn}</span>
        </div>
        <button onClick={()=>setShowQ(v=>!v)} style={{marginTop:10,background:"transparent",border:`1px solid ${C.border}`,color:C.dim,borderRadius:7,padding:"5px 12px",fontSize:12,cursor:"pointer"}}>{showQ?t.hideQ:t.showQ}</button>
        {showQ&&<div style={{marginTop:8}}>{risk.questions.map((q,i)=>(<div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderTop:`1px solid ${C.border}`}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:q.ok?C.greenLt:C.red,flexShrink:0,width:36}}>{q.ok?t.qa:t.qn}</span><span style={{fontSize:11.5,color:C.dim,lineHeight:1.4}}>{i+1}. {q.q}</span></div>))}</div>}
      </div>
      <div style={{fontSize:10.5,letterSpacing:"1px",color:C.dim,fontWeight:700,margin:"18px 0 10px"}}>{t.fundT}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(255px,1fr))",gap:12}}>
        {cats.map(cat=>(<div key={cat.key} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,position:"relative",overflow:"hidden"}}>
          {cat.rating&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:rC(cat.rating),opacity:.8}}/>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:12.5,fontWeight:700,color:C.text}}>{cat.title}</span>
            {cat.rating?<span style={{fontSize:10.5,fontWeight:700,color:rC(cat.rating),background:rC(cat.rating)+"1f",border:`1px solid ${rC(cat.rating)}55`,borderRadius:6,padding:"2px 8px"}}>{rL(cat.rating)}</span>:<span style={{fontSize:10.5,color:C.faint}}>---</span>}
          </div>
          {cat.rows.map((r,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderTop:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:r.rk?rC(r.rk):C.faint,flexShrink:0,boxShadow:r.rk?`0 0 5px ${rC(r.rk)}`:"none"}}/>
              <span style={{fontSize:11,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.label}</span>
            </div>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11.5,color:r.rk?rC(r.rk):C.faint,flexShrink:0,marginLeft:6}}>{r.value}</span>
          </div>))}
        </div>))}
      </div>
    </div>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer({setPage,lang}){
  const fn=getST(lang).nav;
  const fd=getST(lang).footer;
  return(
    <footer style={{borderTop:`1px solid ${C.border}`,padding:"36px 24px",marginTop:20}}>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:18,textAlign:"center"}}>
        <button onClick={()=>setPage("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
          <Logo size={30}/>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.text}}>SAVURA <span style={{color:C.greenLt}}>INVEST</span></div>
        </button>
        <p style={{fontSize:12.5,color:C.faint,maxWidth:380,lineHeight:1.7,margin:0}}>{fd.desc}</p>
        <div style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center"}}>
          {[[fn.home,"home"],[fn.tool,"tool"],[fn.course,"course"],[fn.journal||"Kundalik","journal"],[fn.demo||"Demo","demo"],[fn.about,"about"]].map(function(it){return(
            <button key={it[1]} onClick={()=>setPage(it[1])} style={{background:"none",border:"none",cursor:"pointer",color:C.faint,fontSize:12.5,fontFamily:"'Manrope',sans-serif"}}>{it[0]}</button>
          );})}
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <a href="https://t.me/savura_invest" target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:7,color:C.dim,textDecoration:"none",fontSize:13,padding:"7px 12px",border:`1px solid ${C.border}`,borderRadius:8,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blueLt;e.currentTarget.style.color=C.blueLt;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.dim;}}><TgIcon s={15}/> @savura_invest</a>
          <a href="https://instagram.com/savura_invest" target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:7,color:C.dim,textDecoration:"none",fontSize:13,padding:"7px 12px",border:`1px solid ${C.border}`,borderRadius:8,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#e1306c";e.currentTarget.style.color="#e1306c";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.dim;}}><IgIcon s={15}/> savura_invest</a>
        </div>
        <div style={{fontSize:11,color:C.faint}}>© {new Date().getFullYear()} Savura Invest. Bahromaliyev Muhammadyusuf.</div>
      </div>
    </footer>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

// ─── AI Chat Widget ────────────────────────────────────────────────────────
const AiIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" strokeOpacity="0.8"/>
    <path d="M8 10h8M8 14h5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="17.5" cy="6.5" r="2.5" fill="#52d869"/>
    <path d="M16.5 6.5L18.5 6.5M17.5 5.5L17.5 7.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const SavuraAiIcon = ({size=26}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="aiGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2f7df6"/>
        <stop offset="1" stopColor="#1db584"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="10" fill="url(#aiGrad)"/>
    <circle cx="10" cy="13" r="2" fill="white" fillOpacity="0.9"/>
    <circle cx="16" cy="11" r="2" fill="white"/>
    <circle cx="22" cy="13" r="2" fill="white" fillOpacity="0.9"/>
    <path d="M7 20 Q16 25 25 20" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <circle cx="26" cy="7" r="3" fill="#52d869"/>
    <path d="M24.8 7h2.4M26 5.8v2.4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

function ChatWidget({lang}){
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    {role:"assistant", content:"Salom! Men Savura Invest AI yordamchisiman 👋\n\nFundamental tahlil, halol investitsiya, kurs va Savura Invest haqida savollaringizga javob beraman."}
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = React.useRef(null);

  React.useEffect(()=>{
    if(open && bottomRef.current) bottomRef.current.scrollIntoView({behavior:"smooth"});
  },[msgs, open]);

  React.useEffect(()=>{
    const t = setTimeout(()=>setPulse(false), 5000);
    return ()=>clearTimeout(t);
  },[]);

  async function send(){
    const text = input.trim();
    if(!text || loading) return;
    const newMsgs = [...msgs, {role:"user", content:text}];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({messages: newMsgs.slice(-10)})
      });
      if(!res.ok){ const e=await res.json(); throw new Error(e.error||"Server xatosi"); }
      const data = await res.json();
      setMsgs(m=>[...m, {role:"assistant", content: data.reply||"Javob topilmadi."}]);
    } catch(e) {
      setMsgs(m=>[...m, {role:"assistant", content:"⚠️ "+e.message+". GEMINI_KEY Vercel Environment Variables da o'rnatilganligini tekshiring."}]);
    }
    setLoading(false);
  }

  const SUGGESTIONS = [
    "P/E nisbati nima degani?",
    "Kurs haqida ma'lumot bering",
    "Halol aksiya qanday tanlanadi?",
    "Muhammadyusuf haqida ayt",
  ];

  const BG = "rgba(8,14,30,0.97)";
  const BORDER = "rgba(74,163,255,0.18)";

  return(
    <div style={{position:"fixed", bottom:20, right:20, zIndex:9999, display:"flex", flexDirection:"column", alignItems:"flex-end"}}>

      {/* Notification bubble */}
      {!open && pulse && (
        <div style={{background:"linear-gradient(135deg,#1a3a6e,#0d2137)", border:"1px solid rgba(74,163,255,0.3)", borderRadius:12, padding:"8px 14px", marginBottom:10, fontSize:12, color:"#a0c4ff", maxWidth:200, boxShadow:"0 4px 20px rgba(0,0,0,0.4)", animation:"fadeIn .5s ease"}}>
          Savol bering, javob beraman! 💬
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{width:340, height:490, background:BG, border:"1px solid "+BORDER, borderRadius:20, boxShadow:"0 24px 64px rgba(0,0,0,0.6)", display:"flex", flexDirection:"column", marginBottom:12, overflow:"hidden", backdropFilter:"blur(12px)"}}>

          {/* Header */}
          <div style={{background:"linear-gradient(135deg,#1a3a6e 0%,#0d3d2a 100%)", padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid "+BORDER}}>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <SavuraAiIcon size={38}/>
              <div>
                <div style={{fontSize:14, fontWeight:700, color:"#e8f4ff", fontFamily:"'Sora',sans-serif"}}>Savura AI</div>
                <div style={{display:"flex", alignItems:"center", gap:5}}>
                  <div style={{width:6, height:6, borderRadius:"50%", background:"#52d869"}}/>
                  <span style={{fontSize:10, color:"#52d869"}}>Online</span>
                </div>
              </div>
            </div>
            <div style={{display:"flex", gap:8}}>
              <button onClick={()=>setMsgs(msgs.slice(0,1))} style={{background:"rgba(255,255,255,0.07)", border:"none", borderRadius:8, color:"#8099c0", fontSize:11, padding:"4px 9px", cursor:"pointer"}}>Tozala</button>
              <button onClick={()=>setOpen(false)} style={{background:"rgba(255,255,255,0.07)", border:"none", borderRadius:8, color:"#8099c0", fontSize:14, padding:"2px 8px", cursor:"pointer"}}>✕</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{flex:1, overflowY:"auto", padding:"14px", display:"flex", flexDirection:"column", gap:10}}>
            {msgs.map(function(m,i){
              return(
                <div key={i} style={{display:"flex", justifyContent: m.role==="user"?"flex-end":"flex-start", gap:8, alignItems:"flex-end"}}>
                  {m.role==="assistant" && <SavuraAiIcon size={24}/>}
                  <div style={{maxWidth:"80%", padding:"10px 13px",
                    borderRadius: m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
                    background: m.role==="user"
                      ? "linear-gradient(135deg,#2f7df6,#1a6de0)"
                      : "rgba(255,255,255,0.05)",
                    border: m.role==="assistant" ? "1px solid rgba(74,163,255,0.12)" : "none",
                    color: m.role==="user" ? "#fff" : "#c8d8f0",
                    fontSize:12.5, lineHeight:1.65, whiteSpace:"pre-wrap"}}>
                    {m.content}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div style={{display:"flex", gap:8, alignItems:"center"}}>
                <SavuraAiIcon size={24}/>
                <div style={{background:"rgba(255,255,255,0.05)", border:"1px solid rgba(74,163,255,0.12)", borderRadius:"16px 16px 16px 4px", padding:"12px 16px", display:"flex", gap:5}}>
                  {[0,1,2].map(function(i){ return(
                    <div key={i} style={{width:6, height:6, borderRadius:"50%", background:"#4aa3ff", opacity: 0.6+i*0.2, animation:"bounce 1s "+i*0.15+"s infinite"}}/>
                  ); })
                  }
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Suggestions */}
          {msgs.length === 1 && (
            <div style={{padding:"0 12px 10px", display:"flex", flexWrap:"wrap", gap:6}}>
              {SUGGESTIONS.map(function(s){ return(
                <button key={s} onClick={function(){setInput(s);}}
                  style={{background:"rgba(47,125,246,0.1)", border:"1px solid rgba(47,125,246,0.25)", borderRadius:20, color:"#7ab8ff", fontSize:10.5, padding:"5px 11px", cursor:"pointer", fontFamily:"'Sora',sans-serif"}}>
                  {s}
                </button>
              ); })}
            </div>
          )}

          {/* Input */}
          <div style={{padding:"10px 12px", borderTop:"1px solid "+BORDER, display:"flex", gap:8, background:"rgba(0,0,0,0.2)"}}>
            <input value={input}
              onChange={function(e){setInput(e.target.value);}}
              onKeyDown={function(e){if(e.key==="Enter")send();}}
              placeholder="Savol yozing..."
              style={{flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid "+BORDER, borderRadius:12, color:"#e0ecff", padding:"9px 13px", fontSize:12.5, outline:"none", fontFamily:"'Sora',sans-serif"}}
            />
            <button onClick={send} disabled={loading||!input.trim()}
              style={{width:40, height:40, borderRadius:12, flexShrink:0,
                background: input.trim()&&!loading ? "linear-gradient(135deg,#2f7df6,#1db584)" : "rgba(255,255,255,0.06)",
                border:"none", color:"#fff", fontSize:16, cursor: input.trim()&&!loading?"pointer":"default",
                display:"flex", alignItems:"center", justifyContent:"center"}}>
              {loading ? "⏳" : "➤"}
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button onClick={function(){setOpen(function(v){return !v;}); setPulse(false);}}
        style={{width:54, height:54, borderRadius:16,
          background: open ? "rgba(20,40,80,0.9)" : "linear-gradient(135deg,#2f7df6,#1db584)",
          border: open ? "1.5px solid rgba(74,163,255,0.4)" : "none",
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 8px 28px rgba(47,125,246,0.45)", transition:"all .3s"}}>
        {open
          ? <span style={{color:"#7ab8ff", fontSize:20}}>✕</span>
          : <SavuraAiIcon size={28}/>
        }
      </button>
    </div>
  );
}




// ─── Journal & Demo translations ─────────────────────────────────────────────
const JNL_T = {
  uz:{title:"Savdo Kundaligi", tabs:["Kundalik","Tekshiruv","Kuzatuv"],
    new:"+ Yangi yozuv", close:"Yopish", save:"Saqlash", del:"CSV",
    stAll:"Barchasi",stOpen:"Ochiq",stProfit:"Foydali",stLoss:"Zararli",
    noEntry:"Yozuv yo'q. Yangi yozuv qo'shing.",noCheck:"Saqlangan tekshiruv yo'q.",noWatch:"Ro'yxat bo'sh.",
    newCheck:"+ Yangi tekshiruv", checkHist:"Tarix", addWatch:"+ Aksiya qo'shish",
    watchStatuses:{watching:"Kuzatilmoqda",bought:"Sotib olindi",passed:"O'tkazib yuborildi"},
    trDate:"Sana",trTicker:"Ticker",trAction:"Harakat",trPrice:"Narx",trShares:"Miqdor",trPnl:"P&L",trResult:"Natija",trReason:"Sabab",trNotes:"Eslatma"},
  en:{title:"Trading Journal", tabs:["Journal","Checklist","Watchlist"],
    new:"+ New Entry", close:"Close", save:"Save", del:"CSV",
    stAll:"All",stOpen:"Open",stProfit:"Profit",stLoss:"Loss",
    noEntry:"No entries yet.",noCheck:"No saved checklists.",noWatch:"Watchlist empty.",
    newCheck:"+ New Check", checkHist:"History", addWatch:"+ Add Stock",
    watchStatuses:{watching:"Watching",bought:"Bought",passed:"Passed"},
    trDate:"Date",trTicker:"Ticker",trAction:"Action",trPrice:"Price",trShares:"Qty",trPnl:"P&L",trResult:"Result",trReason:"Reason",trNotes:"Notes"},
  tr:{title:"İşlem Günlüğü", tabs:["Günlük","Kontrol","İzleme"],
    new:"+ Yeni Kayıt", close:"Kapat", save:"Kaydet", del:"CSV",
    stAll:"Tümü",stOpen:"Açık",stProfit:"Kârlı",stLoss:"Zararlı",
    noEntry:"Kayıt yok.",noCheck:"Kayıtlı kontrol yok.",noWatch:"Liste boş.",
    newCheck:"+ Yeni Kontrol", checkHist:"Geçmiş", addWatch:"+ Hisse Ekle",
    watchStatuses:{watching:"İzleniyor",bought:"Alındı",passed:"Geçildi"},
    trDate:"Tarih",trTicker:"Ticker",trAction:"İşlem",trPrice:"Fiyat",trShares:"Adet",trPnl:"K/Z",trResult:"Sonuç",trReason:"Neden",trNotes:"Not"},
  ru:{title:"Торговый Журнал", tabs:["Журнал","Чеклист","Наблюдение"],
    new:"+ Запись", close:"Закрыть", save:"Сохранить", del:"CSV",
    stAll:"Все",stOpen:"Открыт.",stProfit:"Прибыль",stLoss:"Убыток",
    noEntry:"Записей нет.",noCheck:"Чеклистов нет.",noWatch:"Список пуст.",
    newCheck:"+ Новый чеклист", checkHist:"История", addWatch:"+ Добавить",
    watchStatuses:{watching:"Наблюдение",bought:"Куплено",passed:"Пропущено"},
    trDate:"Дата",trTicker:"Тикер",trAction:"Действие",trPrice:"Цена",trShares:"Кол.",trPnl:"П/У",trResult:"Итог",trReason:"Причина",trNotes:"Заметки"},
  ar:{title:"مفكرة التداول", tabs:["اليومية","القائمة","المراقبة"],
    new:"+ إضافة", close:"إغلاق", save:"حفظ", del:"CSV",
    stAll:"الكل",stOpen:"مفتوح",stProfit:"ربح",stLoss:"خسارة",
    noEntry:"لا توجد إدخالات.",noCheck:"لا توجد قوائم.",noWatch:"القائمة فارغة.",
    newCheck:"+ قائمة جديدة", checkHist:"السجل", addWatch:"+ إضافة سهم",
    watchStatuses:{watching:"مراقبة",bought:"تم الشراء",passed:"تم التجاوز"},
    trDate:"التاريخ",trTicker:"الرمز",trAction:"الإجراء",trPrice:"السعر",trShares:"الكمية",trPnl:"ر/خ",trResult:"النتيجة",trReason:"السبب",trNotes:"ملاحظة"},
};

const DMO_T = {
  uz:{title:"Demo Treyding",setup:"Hisob oching",
    bal:"Portfel",cash:"Naqd",invest:"Investitsiya",opnl:"Ochiq P&L",start:"Start",
    refresh:"Yangilash",reset:"Qayta boshlash",resetQ:"Demo hisobni o'chirib, yangi boshlaysizmi?",
    buyTitle:"Sotib Olish",sell:"Sotish",confirm:"Tasdiqlash",cancel:"Bekor",
    ticker:"Ticker",qty:"Miqdor",sl:"Stop Loss",tp:"Take Profit",
    fetchBtn:"Narx",total:"Jami",rr:"Risk/Reward",maxLoss:"Max zarar",
    buyBtn:"Sotib Olish",disclaimer:"Demo — haqiqiy pul ishtirok etmaydi",
    assets:"Aktivlar",tradeTab:"Savdo",histTab:"Tarix",
    noPos:"Hozircha aktiv yo'q.",noHist:"Yopilgan savdo yo'q.",
    colTicker:"Ticker",colQty:"Dona",colEntry:"Kirish",colCur:"Hozir",colPnl:"P&L",colPct:"P&L%",colSl:"SL",colTp:"TP",
    histEntry:"Kirish",histExit:"Chiqish",histQty:"Dona",histPnl:"P&L",histReason:"Sabab",histDate:"Sana",
    startLabel:["Start","O'rtacha","Standart","Professional"]},
  en:{title:"Demo Trading",setup:"Open Account",
    bal:"Portfolio",cash:"Cash",invest:"Invested",opnl:"Open P&L",start:"Starting",
    refresh:"Refresh",reset:"Reset",resetQ:"Reset demo account?",
    buyTitle:"Buy Stock",sell:"Sell",confirm:"Confirm",cancel:"Cancel",
    ticker:"Ticker",qty:"Shares",sl:"Stop Loss",tp:"Take Profit",
    fetchBtn:"Price",total:"Total",rr:"Risk/Reward",maxLoss:"Max loss",
    buyBtn:"Buy",disclaimer:"Demo — no real money involved",
    assets:"Assets",tradeTab:"Trade",histTab:"History",
    noPos:"No open positions.",noHist:"No closed trades.",
    colTicker:"Ticker",colQty:"Qty",colEntry:"Entry",colCur:"Current",colPnl:"P&L",colPct:"P&L%",colSl:"SL",colTp:"TP",
    histEntry:"Entry",histExit:"Exit",histQty:"Qty",histPnl:"P&L",histReason:"Reason",histDate:"Date",
    startLabel:["Starter","Moderate","Standard","Professional"]},
  tr:{title:"Demo Ticaret",setup:"Hesap Aç",
    bal:"Portföy",cash:"Nakit",invest:"Yatırım",opnl:"Açık K/Z",start:"Başlangıç",
    refresh:"Yenile",reset:"Sıfırla",resetQ:"Demo hesabı sıfırlayın mı?",
    buyTitle:"Hisse Al",sell:"Sat",confirm:"Onayla",cancel:"İptal",
    ticker:"Ticker",qty:"Adet",sl:"Stop Loss",tp:"Take Profit",
    fetchBtn:"Fiyat",total:"Toplam",rr:"Risk/Ödül",maxLoss:"Max kayıp",
    buyBtn:"Al",disclaimer:"Demo — gerçek para yok",
    assets:"Varlıklar",tradeTab:"İşlem",histTab:"Geçmiş",
    noPos:"Açık pozisyon yok.",noHist:"Kapalı işlem yok.",
    colTicker:"Ticker",colQty:"Adet",colEntry:"Giriş",colCur:"Güncel",colPnl:"K/Z",colPct:"K/Z%",colSl:"SL",colTp:"TP",
    histEntry:"Giriş",histExit:"Çıkış",histQty:"Adet",histPnl:"K/Z",histReason:"Sebep",histDate:"Tarih",
    startLabel:["Başlangıç","Orta","Standart","Profesyonel"]},
  ru:{title:"Демо Торговля",setup:"Открыть счёт",
    bal:"Портфель",cash:"Наличные",invest:"Инвестиции",opnl:"Незакр. П/У",start:"Начальный",
    refresh:"Обновить",reset:"Сбросить",resetQ:"Сбросить демо-счёт?",
    buyTitle:"Купить акцию",sell:"Продать",confirm:"Подтвердить",cancel:"Отмена",
    ticker:"Тикер",qty:"Кол-во",sl:"Стоп-лосс",tp:"Тейк-профит",
    fetchBtn:"Цена",total:"Итого",rr:"Риск/Доход",maxLoss:"Макс. убыток",
    buyBtn:"Купить",disclaimer:"Демо — реальных денег нет",
    assets:"Активы",tradeTab:"Сделка",histTab:"История",
    noPos:"Нет открытых позиций.",noHist:"Нет закрытых сделок.",
    colTicker:"Тикер",colQty:"Кол.",colEntry:"Вход",colCur:"Текущая",colPnl:"П/У",colPct:"П/У%",colSl:"СЛ",colTp:"ТП",
    histEntry:"Вход",histExit:"Выход",histQty:"Кол.",histPnl:"П/У",histReason:"Причина",histDate:"Дата",
    startLabel:["Начальный","Средний","Стандарт","Профессионал"]},
  ar:{title:"التداول التجريبي",setup:"فتح الحساب",
    bal:"المحفظة",cash:"نقداً",invest:"مستثمر",opnl:"ر/خ مفتوح",start:"البداية",
    refresh:"تحديث",reset:"إعادة",resetQ:"إعادة تعيين الحساب التجريبي؟",
    buyTitle:"شراء سهم",sell:"بيع",confirm:"تأكيد",cancel:"إلغاء",
    ticker:"الرمز",qty:"الكمية",sl:"وقف الخسارة",tp:"جني الأرباح",
    fetchBtn:"السعر",total:"المجموع",rr:"المخاطرة",maxLoss:"أقصى خسارة",
    buyBtn:"شراء",disclaimer:"تجريبي — لا أموال حقيقية",
    assets:"الأصول",tradeTab:"تداول",histTab:"السجل",
    noPos:"لا توجد مراكز مفتوحة.",noHist:"لا توجد صفقات مغلقة.",
    colTicker:"الرمز",colQty:"الكمية",colEntry:"الدخول",colCur:"الحالي",colPnl:"ر/خ",colPct:"ر/خ%",colSl:"SL",colTp:"TP",
    histEntry:"الدخول",histExit:"الخروج",histQty:"الكمية",histPnl:"ر/خ",histReason:"السبب",histDate:"التاريخ",
    startLabel:["مبتدئ","متوسط","قياسي","محترف"]},
};
// ─── localStorage helpers ────────────────────────────────────────────────────
function lsGet(key){ try{return JSON.parse(localStorage.getItem(key))||[];}catch{return[];} }
function lsSave(key,data){ localStorage.setItem(key,JSON.stringify(data)); }
function lsGetObj(key,def={}){ try{return JSON.parse(localStorage.getItem(key))||def;}catch{return def;} }

function csvExport(rows, filename){
  if(!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(','), ...rows.map(r=>keys.map(k=>'"'+(r[k]||'')+'"').join(','))].join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv);
  a.download = filename; a.click();
}

// ─── Journal Tab ─────────────────────────────────────────────────────────────
function JournalTab(){
  const KEY = 'savura_journal_v1';
  const [entries, setEntries] = useState(()=>lsGet(KEY));
  const [showForm, setShowForm] = useState(false);
  const EMPTY = {date:new Date().toISOString().split('T')[0],ticker:'',action:'BUY',price:'',shares:'',pnl:'',result:'OPEN',reason:'',notes:''};
  const [form, setForm] = useState(EMPTY);
  const [filter, setFilter] = useState('ALL');

  function save(){
    if(!form.ticker.trim()) return;
    const entry = {...form, id:Date.now(), ticker:form.ticker.toUpperCase()};
    const next = [entry, ...entries];
    setEntries(next); lsSave(KEY, next);
    setForm(EMPTY); setShowForm(false);
  }
  function del(id){ const next=entries.filter(e=>e.id!==id); setEntries(next); lsSave(KEY,next); }

  const inp = (field,type='text',ph='')=>(
    <input type={type} value={form[field]} placeholder={ph}
      onChange={e=>setForm(f=>({...f,[field]:e.target.value}))}
      style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:'8px 11px',fontSize:13,outline:'none',width:'100%',fontFamily:"'JetBrains Mono',monospace"}}/>
  );

  const filtered = filter==='ALL'?entries:entries.filter(e=>e.result===filter);
  const totalPnl = entries.filter(e=>e.pnl).reduce((s,e)=>s+(parseFloat(e.pnl)||0),0);

  return(
    <div>
      {/* Stats row */}
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        {[
          ['Jami savdo',entries.length,''],
          ['Ochiq pozitsiya',entries.filter(e=>e.result==='OPEN').length,''],
          ['Foyda',entries.filter(e=>e.result==='PROFIT').length,C.green],
          ['Zarar',entries.filter(e=>e.result==='LOSS').length,C.red],
          ['Umumiy P&L',(totalPnl>=0?'+':'')+totalPnl.toFixed(0)+' $', totalPnl>=0?C.green:C.red],
        ].map(([l,v,col])=>(
          <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:'12px 18px',flex:1,minWidth:120}}>
            <div style={{fontSize:11,color:C.faint,marginBottom:4}}>{l}</div>
            <div style={{fontSize:20,fontWeight:700,color:col||C.text,fontFamily:"'JetBrains Mono',monospace"}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <button onClick={()=>setShowForm(v=>!v)}
          style={{background:`linear-gradient(135deg,${C.blue},${C.green})`,border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:13,padding:'9px 18px',cursor:'pointer'}}>
          {showForm?J.close:J.new}
        </button>
        {['ALL','OPEN','PROFIT','LOSS'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{background:filter===f?'rgba(47,125,246,0.2)':'transparent',border:`1px solid ${filter===f?C.blue:C.border}`,borderRadius:8,color:filter===f?C.blueLt:C.dim,fontSize:12,padding:'7px 14px',cursor:'pointer'}}>
            {f==='ALL'?'Barchasi':f==='OPEN'?"Ochiq":f==='PROFIT'?'Foydali':'Zararli'}
          </button>
        ))}
        <button onClick={()=>csvExport(entries,'savura_journal.csv')}
          style={{background:'transparent',border:`1px solid ${C.border}`,borderRadius:8,color:C.dim,fontSize:12,padding:'7px 14px',cursor:'pointer',marginLeft:'auto'}}>
          ⬇ CSV
        </button>
      </div>

      {/* Add form */}
      {showForm&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'18px',marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Yangi savdo yozuvi</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10,marginBottom:12}}>
            <div><div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>Sana</div>{inp('date','date')}</div>
            <div><div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>Ticker</div>{inp('ticker','text','AAPL')}</div>
            <div>
              <div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>Harakat</div>
              <select value={form.action} onChange={e=>setForm(f=>({...f,action:e.target.value}))}
                style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:'8px 11px',fontSize:13,outline:'none',width:'100%'}}>
                <option value="BUY">BUY — Sotib olish</option>
                <option value="SELL">SELL — Sotish</option>
              </select>
            </div>
            <div><div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>Narx ($)</div>{inp('price','number','195.50')}</div>
            <div><div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>Miqdor (dona)</div>{inp('shares','number','10')}</div>
            <div><div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>P&L ($)</div>{inp('pnl','number','+150')}</div>
            <div>
              <div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>Natija</div>
              <select value={form.result} onChange={e=>setForm(f=>({...f,result:e.target.value}))}
                style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:'8px 11px',fontSize:13,outline:'none',width:'100%'}}>
                <option value="OPEN">Ochiq (hali davom etmoqda)</option>
                <option value="PROFIT">Foydali ✓</option>
                <option value="LOSS">Zararli ✗</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>Sabab (nima uchun bu savdo?)</div>
            <textarea value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} rows={2}
              placeholder="Masalan: ROIC 33%, P/E bozor o'rtachasiga yaqin, sektor yetakchisi..."
              style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:'8px 11px',fontSize:12.5,outline:'none',width:'100%',resize:'vertical',fontFamily:"'Sora',sans-serif"}}/>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>Qo'shimcha eslatma</div>
            <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2}
              placeholder="Qo'shimcha fikrlar..."
              style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:'8px 11px',fontSize:12.5,outline:'none',width:'100%',resize:'vertical',fontFamily:"'Sora',sans-serif"}}/>
          </div>
          <button onClick={save}
            style={{background:`linear-gradient(135deg,${C.blue},${C.green})`,border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:14,padding:'10px 28px',cursor:'pointer'}}>
            Saqlash
          </button>
        </div>
      )}

      {/* Entries */}
      {filtered.length===0
        ?<div style={{textAlign:'center',padding:'48px 24px',color:C.faint,fontSize:13}}>Hali yozuv yo'q. "+ Yangi yozuv" bosing.</div>
        :filtered.map(e=>{
          const col = e.result==='PROFIT'?C.green:e.result==='LOSS'?C.red:C.amber;
          const pnlN = parseFloat(e.pnl)||0;
          return(
            <div key={e.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 16px',marginBottom:10,display:'flex',gap:14,alignItems:'flex-start',flexWrap:'wrap'}}>
              <div style={{minWidth:90}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:18,color:C.blueLt}}>{e.ticker}</div>
                <div style={{fontSize:10.5,color:C.faint}}>{e.date}</div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                <span style={{background:e.action==='BUY'?'rgba(55,178,77,0.15)':'rgba(229,72,77,0.15)',border:`1px solid ${e.action==='BUY'?C.green:C.red}`,borderRadius:6,padding:'2px 8px',fontSize:11,fontWeight:700,color:e.action==='BUY'?C.green:C.red}}>{e.action}</span>
                {e.price&&<span style={{fontSize:12,color:C.dim}}>${e.price}</span>}
                {e.shares&&<span style={{fontSize:12,color:C.dim}}>×{e.shares}</span>}
                {e.pnl&&<span style={{fontWeight:700,fontSize:13,color:pnlN>=0?C.green:C.red}}>{pnlN>=0?'+':''}{e.pnl}$</span>}
                <span style={{background:`rgba(0,0,0,0.3)`,border:`1px solid ${col}`,borderRadius:6,padding:'2px 8px',fontSize:10.5,color:col}}>{e.result==='PROFIT'?J.stProfit+' ✓':e.result==='LOSS'?J.stLoss+' ✗':J.stOpen+' ○'}</span>
              </div>
              {e.reason&&<div style={{flex:1,fontSize:12,color:C.dim,minWidth:200}}>{e.reason}</div>}
              <button onClick={()=>del(e.id)} style={{background:'transparent',border:'none',color:C.faint,cursor:'pointer',fontSize:16,marginLeft:'auto'}}>🗑</button>
            </div>
          );
        })
      }
    </div>
  );
}

// ─── Checklist Tab ────────────────────────────────────────────────────────────
const CL_QUESTIONS = [
  "Moliyaviy sog'lomlik ko'rsatkichlari o'tacha yoki yuqori? (Current Ratio, D/E, Interest Coverage)",
  "Rentabellik ko'rsatkichlari o'tacha yoki yuqori? (Gross Margin, Oper. Margin, Net Margin)",
  "Samaradorlik ko'rsatkichlari o'tacha yoki yuqori? (ROA, ROE, ROIC)",
  "O'sish ko'rsatkichlari o'tacha yoki yuqori? (Revenue Growth, EPS Growth)",
  "P/E bozor o'rtachasiga yaqin yoki kichik? (P/E ≤ 28)",
  "O'tgan yil va chorakda foydali bo'lganmi? (Net Margin > 0)",
  "Operatsion pul oqimi musbat bo'lganmi? (OCF > 0)",
  "Beta 1.5 dan kichikmi? (Beta < 1.5)",
  "Bozor kapitalizatsiyasi $2 mlrd yoki ko'pmi? (Market Cap ≥ $2B)",
  "Himoya qiluvchi sektordami? (Healthcare/Utilities/Consumer Staples/Energy)",
  "Sanoatida top-10 ichidami? (bozor kap. bo'yicha)",
  "Geosiyosiy/huquqiy muammo yo'qmi? (katta SEC ishi, jarima yo'q)",
  "So'nggi 5 yilda S&P 500 dan ustun keldimi?",
  "Kutilmagan risklar baholab ko'rildi? (har doim No)",
  "Qo'shimcha shaxsiy tekshiruv o'tkazildi? (har doim No)",
];

function ChecklistTab(){
  const KEY = 'savura_checks_v1';
  const [history, setHistory] = useState(()=>lsGet(KEY));
  const [ticker, setTicker] = useState('');
  const [answers, setAnswers] = useState(Array(15).fill(false));
  const [notes, setNotes] = useState('');
  const [view, setView] = useState('form'); // form | history

  function toggle(i){ setAnswers(a=>{const n=[...a];n[i]=!n[i];return n;}); }

  function calcRisk(ans){
    const no = ans.filter(a=>!a).length;
    if(no<=3) return {level:'PAST',color:C.green};
    if(no<=5) return {level:"O'RTA",color:C.amber};
    if(no<=9) return {level:'YUQORI',color:C.orange};
    return {level:'JUDA YUQORI',color:C.red};
  }

  const noCount = answers.filter(a=>!a).length;
  const risk = calcRisk(answers);

  function saveCheck(){
    if(!ticker.trim()) return;
    const entry = {id:Date.now(), date:new Date().toISOString().split('T')[0], ticker:ticker.toUpperCase(), answers:[...answers], noCount, riskLevel:risk.level, notes};
    const next = [entry,...history];
    setHistory(next); lsSave(KEY,next);
    setTicker(''); setAnswers(Array(15).fill(false)); setNotes('');
    setView('history');
  }
  function del(id){ const next=history.filter(e=>e.id!==id); setHistory(next); lsSave(KEY,next); }

  return(
    <div>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[["form",J.newCheck],["history",J.checkHist+(history.length?" ("+history.length+")":"")]].map(([k,l])=>(
          <button key={k} onClick={()=>setView(k)}
            style={{background:view===k?`linear-gradient(135deg,${C.blue},${C.green})`:'transparent',border:`1px solid ${view===k?'transparent':C.border}`,borderRadius:8,color:view===k?'#fff':C.dim,fontSize:13,fontWeight:view===k?700:400,padding:'8px 16px',cursor:'pointer'}}>
            {l} {k==='history'&&history.length?`(${history.length})`:''}
          </button>
        ))}
      </div>

      {view==='form'&&(
        <div>
          {/* Ticker + risk badge */}
          <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:20,flexWrap:'wrap'}}>
            <input value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())} placeholder="Ticker: AAPL"
              style={{background:'rgba(12,20,38,.85)',border:`1px solid ${C.border}`,borderRadius:10,color:C.text,padding:'10px 16px',fontSize:18,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,width:140,outline:'none'}}/>
            <div style={{background:`rgba(0,0,0,0.3)`,border:`2px solid ${risk.color}`,borderRadius:12,padding:'8px 16px',textAlign:'center'}}>
              <div style={{fontSize:10,color:C.faint,marginBottom:2}}>RISK DARAJASI</div>
              <div style={{fontWeight:800,fontSize:18,color:risk.color,fontFamily:"'JetBrains Mono',monospace"}}>{risk.level}</div>
              <div style={{fontSize:11,color:C.faint}}>{noCount}/15 Yo'q</div>
            </div>
          </div>

          {/* 15 questions */}
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
            {CL_QUESTIONS.map((q,i)=>{
              const last2 = i>=13;
              return(
                <div key={i}
                  onClick={()=>!last2&&toggle(i)}
                  style={{display:'flex',gap:12,padding:'11px 14px',background:C.card,border:`1px solid ${answers[i]?'rgba(55,178,77,0.3)':last2?'rgba(229,72,77,0.2)':C.border}`,borderRadius:10,cursor:last2?'default':'pointer',alignItems:'flex-start',opacity:last2?0.7:1}}>
                  <div style={{flexShrink:0,width:22,height:22,borderRadius:6,marginTop:1,
                    background: last2?C.red:answers[i]?C.green:'transparent',
                    border:`2px solid ${last2?C.red:answers[i]?C.green:C.border}`,
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{color:'#fff',fontSize:12,fontWeight:700}}>{last2?'✗':answers[i]?'✓':''}</span>
                  </div>
                  <div style={{flex:1}}>
                    <span style={{fontSize:10,color:C.faint,fontFamily:"'JetBrains Mono',monospace",marginRight:6}}>{i+1}.</span>
                    <span style={{fontSize:12.5,color:answers[i]||last2?C.dim:C.text,lineHeight:1.5}}>{q}</span>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:last2?C.red:answers[i]?C.green:C.faint,flexShrink:0}}>
                    {last2?"Yo'q":answers[i]?"Ha":"Yo'q"}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>Qo'shimcha eslatmalar</div>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Nima uchun bu aksiyani tekshirdim..."
              style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:'9px 12px',fontSize:12.5,outline:'none',width:'100%',resize:'vertical',fontFamily:"'Sora',sans-serif"}}/>
          </div>
          <button onClick={saveCheck} disabled={!ticker.trim()}
            style={{background:ticker.trim()?`linear-gradient(135deg,${C.blue},${C.green})`:'rgba(255,255,255,0.05)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:14,padding:'11px 28px',cursor:ticker.trim()?'pointer':'default'}}>
            Saqlash — {risk.level}
          </button>
        </div>
      )}

      {view==='history'&&(
        <div>
          {history.length===0
            ?<div style={{textAlign:'center',padding:'40px',color:C.faint,fontSize:13}}>Hali saqlangan tekshiruv yo'q.</div>
            :history.map(e=>{
              const col = e.riskLevel==='PAST'?C.green:e.riskLevel==="O'RTA"?C.amber:e.riskLevel==='YUQORI'?C.orange:C.red;
              const yes = e.answers.filter(Boolean).length;
              return(
                <div key={e.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 16px',marginBottom:10,display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}>
                  <div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:20,color:C.blueLt}}>{e.ticker}</div>
                    <div style={{fontSize:10.5,color:C.faint}}>{e.date}</div>
                  </div>
                  <div style={{flex:1}}>
                    <span style={{border:`1.5px solid ${col}`,borderRadius:8,padding:'3px 10px',fontSize:12,fontWeight:700,color:col}}>{e.riskLevel}</span>
                    <span style={{fontSize:12,color:C.dim,marginLeft:10}}>{yes} Ha / {e.noCount} Yo'q</span>
                    {e.notes&&<div style={{fontSize:12,color:C.faint,marginTop:4}}>{e.notes}</div>}
                  </div>
                  <button onClick={()=>del(e.id)} style={{background:'transparent',border:'none',color:C.faint,cursor:'pointer',fontSize:16}}>🗑</button>
                </div>
              );
            })
          }
          <button onClick={()=>csvExport(history.map(e=>({...e,answers:e.answers.map((a,i)=>a?'Ha':"Yo'q").join(' | ')})),'savura_checklists.csv')}
            style={{background:'transparent',border:`1px solid ${C.border}`,borderRadius:8,color:C.dim,fontSize:12,padding:'7px 14px',cursor:'pointer',marginTop:8}}>
            ⬇ CSV eksport
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Watchlist Tab ────────────────────────────────────────────────────────────
function WatchlistTab(){
  const KEY = 'savura_watch_v1';
  const [items, setItems] = useState(()=>lsGet(KEY));
  const [showForm, setShowForm] = useState(false);
  const EMPTY = {ticker:'',company:'',targetPrice:'',notes:'',status:'watching'};
  const [form, setForm] = useState(EMPTY);
  const [lookupState, setLookupState] = useState('idle');

  async function lookupTicker(sym){
    const s = sym.trim().toUpperCase();
    if(!s) return;
    setLookupState('loading');
    try {
      const r = await fetch('/api/lookup?sym='+s);
      const data = await r.json();
      if(data && data.companyName){
        setForm(function(f){ return {...f, ticker:s, company:data.companyName||f.company, targetPrice:f.targetPrice||(data.price?String(data.price.toFixed(2)):'')}; });
        setLookupState('done');
      } else { setLookupState('error'); }
    } catch(e){ setLookupState('error'); }
  }

  function save(){
    if(!form.ticker.trim()) return;
    const item = {...form,id:Date.now(),addedDate:new Date().toISOString().split('T')[0],ticker:form.ticker.toUpperCase()};
    const next = [item,...items];
    setItems(next); lsSave(KEY,next);
    setForm(EMPTY); setShowForm(false);
  }
  function del(id){ const next=items.filter(e=>e.id!==id); setItems(next); lsSave(KEY,next); }
  function updateStatus(id,status){ const next=items.map(e=>e.id===id?{...e,status}:e); setItems(next); lsSave(KEY,next); }

  const STATUS_COL = {watching:C.amber, bought:C.green, passed:C.faint};
  const STATUS_LBL = {watching:'Kuzatilmoqda 👁', bought:"Sotib olindi ✓", passed:'O\'tkazib yuborildi ✗'};
  const inp = (f,ph='')=>(
    <input value={form[f]} onChange={e=>setForm(x=>({...x,[f]:e.target.value}))} placeholder={ph}
      style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:'8px 11px',fontSize:13,outline:'none',width:'100%',fontFamily:"'JetBrains Mono',monospace"}}/>
  );

  return(
    <div>
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <button onClick={()=>setShowForm(v=>!v)}
          style={{background:`linear-gradient(135deg,${C.blue},${C.green})`,border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:13,padding:'9px 18px',cursor:'pointer'}}>
          {showForm?J.close:J.addWatch}
        </button>
        <div style={{display:'flex',gap:8,marginLeft:'auto',flexWrap:'wrap'}}>
          {Object.entries(STATUS_LBL).map(([k,l])=>(
            <span key={k} style={{fontSize:11,color:STATUS_COL[k],border:`1px solid ${STATUS_COL[k]}`,borderRadius:6,padding:'4px 10px'}}>
              {items.filter(i=>i.status===k).length} {l.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>

      {showForm&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'18px',marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Kuzatuv ro'yxatiga qo'shish</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,marginBottom:12}}>
            <div>
              <div style={{fontSize:10.5,color:C.faint,marginBottom:4,display:'flex',gap:8,alignItems:'center'}}>
                Ticker *
                {lookupState==='loading'&&<span style={{fontSize:10,color:C.amber}}>⏳ qidirilmoqda...</span>}
                {lookupState==='done'&&<span style={{fontSize:10,color:C.green}}>✓ topildi</span>}
                {lookupState==='error'&&<span style={{fontSize:10,color:C.red}}>topilmadi</span>}
              </div>
              <input value={form.ticker}
                onChange={function(e){setForm(function(f){return{...f,ticker:e.target.value.toUpperCase()};});setLookupState('idle');}}
                onBlur={function(e){if(e.target.value.trim()) lookupTicker(e.target.value);}}
                onKeyDown={function(e){if(e.key==='Enter'&&form.ticker.trim()) lookupTicker(form.ticker);}}
                placeholder="AAPL"
                style={{background:'rgba(255,255,255,0.05)',border:'1px solid '+C.border,borderRadius:8,color:C.text,padding:'8px 11px',fontSize:13,outline:'none',width:'100%',fontFamily:"'JetBrains Mono',monospace"}}/>
            </div>
            <div>
              <div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>Kompaniya nomi</div>
              <input value={form.company} onChange={function(e){setForm(function(f){return{...f,company:e.target.value};});}}
                placeholder="Avtomatik to'ldiriladi"
                style={{background:'rgba(255,255,255,0.05)',border:'1px solid '+C.border,borderRadius:8,color:lookupState==='done'?C.greenLt:C.text,padding:'8px 11px',fontSize:13,outline:'none',width:'100%',fontFamily:"'JetBrains Mono',monospace"}}/>
            </div>
            <div>
              <div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>Narx / Maqsad narx ($)</div>
              <input value={form.targetPrice} onChange={function(e){setForm(function(f){return{...f,targetPrice:e.target.value};});}}
                placeholder="Avtomatik yoki o'zing yoz"
                style={{background:'rgba(255,255,255,0.05)',border:'1px solid '+C.border,borderRadius:8,color:lookupState==='done'?C.greenLt:C.text,padding:'8px 11px',fontSize:13,outline:'none',width:'100%',fontFamily:"'JetBrains Mono',monospace"}}/>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>Eslatma</div>
            <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2}
              placeholder="Nima uchun kuzatyapman, qachon kiraman..."
              style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:'8px 11px',fontSize:12.5,outline:'none',width:'100%',resize:'vertical',fontFamily:"'Sora',sans-serif"}}/>
          </div>
          <button onClick={save}
            style={{background:`linear-gradient(135deg,${C.blue},${C.green})`,border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:14,padding:'10px 28px',cursor:'pointer'}}>
            Qo'shish
          </button>
        </div>
      )}

      {items.length===0
        ?<div style={{textAlign:'center',padding:'48px 24px',color:C.faint,fontSize:13}}>Ro'yxat bo'sh. Aksiya qo'shing.</div>
        :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
          {items.map(item=>(
            <div key={item.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'16px',position:'relative'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:22,color:C.blueLt}}>{item.ticker}</div>
                  {item.company&&<div style={{fontSize:12,color:C.dim,marginTop:2}}>{item.company}</div>}
                </div>
                <button onClick={()=>del(item.id)} style={{background:'transparent',border:'none',color:C.faint,cursor:'pointer',fontSize:14}}>✕</button>
              </div>
              {item.targetPrice&&(
                <div style={{marginBottom:8}}>
                  <span style={{fontSize:10.5,color:C.faint}}>Maqsad: </span>
                  <span style={{fontSize:14,fontWeight:700,color:C.green,fontFamily:"'JetBrains Mono',monospace"}}>${item.targetPrice}</span>
                </div>
              )}
              {item.notes&&<div style={{fontSize:12,color:C.dim,marginBottom:10,lineHeight:1.5}}>{item.notes}</div>}
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {Object.entries(STATUS_LBL).map(([k,l])=>(
                  <button key={k} onClick={()=>updateStatus(item.id,k)}
                    style={{background:item.status===k?`rgba(${k==='bought'?'55,178,77':k==='watching'?'240,169,43':'90,106,126'},0.15)`:'transparent',
                      border:`1px solid ${item.status===k?STATUS_COL[k]:C.border}`,
                      borderRadius:6,color:item.status===k?STATUS_COL[k]:C.faint,fontSize:10.5,padding:'4px 9px',cursor:'pointer'}}>
                    {l}
                  </button>
                ))}
              </div>
              <div style={{fontSize:10,color:C.faint,marginTop:8}}>Qo'shilgan: {item.addedDate}</div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

// ─── Journal Page (main) ──────────────────────────────────────────────────────
function JournalPage({lang="uz"}){
  const J = JNL_T[lang]||JNL_T.uz;
  const U_KEY = 'savura_user_v1';
  const [user, setUser] = useState(()=>localStorage.getItem(U_KEY)||'');
  const [nameInput, setNameInput] = useState('');
  const [tab, setTab] = useState('journal');

  if(!user){
    return(
      <div style={{padding:'100px 24px 60px',maxWidth:480,margin:'0 auto',textAlign:'center'}}>
        <div style={{fontSize:10,letterSpacing:'2px',color:C.faint,marginBottom:4}}>SAVURA INVEST</div>
        <div style={{fontSize:10.5,letterSpacing:'2px',color:C.faint,marginBottom:8}}>SHAXSIY DASHBOARD</div>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:26,color:C.text,margin:'0 0 10px'}}>{J.title}</h2>
        <p style={{color:C.dim,fontSize:13,marginBottom:28,lineHeight:1.7}}>Ma'lumotlaringiz faqat shu qurilmada saqlanadi. Boshqa foydalanuvchilar ko'rmaydi.</p>
        <div style={{display:'flex',gap:10}}>
          <input value={nameInput} onChange={e=>setNameInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&nameInput.trim()){localStorage.setItem(U_KEY,nameInput.trim());setUser(nameInput.trim());}}}
            placeholder="Ismingiz (masalan: Muhammadyusuf)"
            style={{flex:1,background:'rgba(12,20,38,.85)',border:`1px solid ${C.border}`,borderRadius:12,color:C.text,padding:'13px 16px',fontSize:14,outline:'none',fontFamily:"'Sora',sans-serif"}}/>
          <button onClick={()=>{if(nameInput.trim()){localStorage.setItem(U_KEY,nameInput.trim());setUser(nameInput.trim());}}}
            style={{background:`linear-gradient(135deg,${C.blue},${C.green})`,border:'none',borderRadius:12,color:'#fff',fontWeight:700,padding:'0 22px',cursor:'pointer',fontSize:14,whiteSpace:'nowrap'}}>
            Kirish →
          </button>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:'85px 24px 60px',maxWidth:1020,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{fontSize:10,letterSpacing:'2px',color:C.faint,marginBottom:4}}>SHAXSIY DASHBOARD</div>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:'clamp(20px,3.5vw,28px)',color:C.text,margin:0}}>
            Salom, <span style={{color:C.greenLt}}>{user}</span> 👋
          </h1>
        </div>
        <button onClick={()=>{localStorage.removeItem(U_KEY);setUser('');}}
          style={{background:'transparent',border:`1px solid ${C.border}`,borderRadius:8,color:C.faint,fontSize:12,padding:'7px 14px',cursor:'pointer'}}>
          Chiqish
        </button>
      </div>

      <div style={{display:'flex',gap:6,marginBottom:28,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:6,width:'fit-content',flexWrap:'wrap'}}>
        {[["journal",J.tabs[0]],["checklist",J.tabs[1]],["watchlist",J.tabs[2]]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{background:tab===k?`linear-gradient(135deg,${C.blue},${C.green})`:'transparent',border:'none',borderRadius:10,color:tab===k?'#fff':C.dim,fontWeight:tab===k?700:400,padding:'9px 18px',cursor:'pointer',fontSize:13,fontFamily:"'Sora',sans-serif",transition:'all .2s'}}>
            {l}
          </button>
        ))}
      </div>

      {tab==='journal'&&<JournalTab/>}
      {tab==='checklist'&&<ChecklistTab/>}
      {tab==='watchlist'&&<WatchlistTab/>}
    </div>
  );
}


// ─── DEMO TRADING ────────────────────────────────────────────────────────────
const DK = 'savura_demo_v1';
function dLoad(){ try{return JSON.parse(localStorage.getItem(DK));}catch{return null;} }
function dSave(d){ localStorage.setItem(DK, JSON.stringify(d)); }

function EquityChart({history, startBal}){
  if(!history||history.length<1) return null;
  const W=600,H=170,PX=8,PY=22;
  const vals=history.map(h=>h.v);
  const minV=Math.min(startBal*0.88,...vals);
  const maxV=Math.max(startBal*1.12,...vals);
  const rng=maxV-minV||1;
  const xs=i=>PX+(i/Math.max(history.length-1,1))*(W-PX*2);
  const ys=v=>H-PY-((v-minV)/rng)*(H-PY*2);
  const lastV=history[history.length-1].v;
  const isUp=lastV>=startBal;
  const col=isUp?'#52d869':'#e5484d';
  const sy=ys(startBal);
  const pts=history.map((h,i)=>xs(i)+','+ys(h.v)).join(' ');
  const area=xs(0)+','+ys(history[0].v)+' '+pts+' '+xs(history.length-1)+','+(H-PY)+' '+xs(0)+','+(H-PY);
  // x axis labels (first, middle, last)
  const xLabels=[];
  if(history.length>0) xLabels.push({i:0,label:history[0].d});
  if(history.length>2) xLabels.push({i:Math.floor(history.length/2),label:history[Math.floor(history.length/2)].d});
  xLabels.push({i:history.length-1,label:history[history.length-1].d});
  return(
    <svg viewBox={'0 0 '+W+' '+H} style={{width:'100%',height:170,display:'block'}}>
      <line x1={PX} y1={sy} x2={W-PX} y2={sy} stroke="rgba(255,255,255,0.12)" strokeDasharray="5,4"/>
      <text x={PX+3} y={sy-5} fontSize="9" fill="rgba(255,255,255,0.25)">Start</text>
      {history.length>1&&<polygon points={area} fill={col+'15'}/>}
      {history.length>1&&<polyline points={pts} fill="none" stroke={col} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>}
      <circle cx={xs(history.length-1)} cy={ys(lastV)} r="4.5" fill={col}/>
      <circle cx={xs(history.length-1)} cy={ys(lastV)} r="9" fill={col} fillOpacity="0.18"/>
      {xLabels.map(({i,label})=>(
        <text key={i} x={xs(i)} y={H-4} fontSize="9" fill="rgba(255,255,255,0.3)" textAnchor="middle">{label}</text>
      ))}
      <text x={W-PX} y={PY-8} fontSize="9" fill="rgba(255,255,255,0.3)" textAnchor="end">${Math.round(maxV).toLocaleString()}</text>
      <text x={W-PX} y={H-PY+12} fontSize="9" fill="rgba(255,255,255,0.3)" textAnchor="end">${Math.round(minV).toLocaleString()}</text>
    </svg>
  );
}

function DemoPage({lang="uz"}){
  const D = DMO_T[lang]||DMO_T.uz;
  const ACCS_KEY = 'savura_demo_accs_v2';
  const ACTIVE_KEY = 'savura_demo_active_v2';
  function loadAccs(){ try{return JSON.parse(localStorage.getItem(ACCS_KEY))||[];}catch{return[];} }
  function saveAccs(a){ localStorage.setItem(ACCS_KEY,JSON.stringify(a)); }
  function loadActive(){ try{return parseInt(localStorage.getItem(ACTIVE_KEY))||0;}catch{return 0;} }
  function saveActive(i){ localStorage.setItem(ACTIVE_KEY,String(i)); }

  const [accs,setAccs] = useState(()=>loadAccs());
  const [activeIdx,setActiveIdx] = useState(()=>{ const i=loadActive(); const a=loadAccs(); return i<a.length?i:0; });
  const [showNew,setShowNew] = useState(false);
  const [newName,setNewName] = useState('');
  const [prices,setPrices] = useState({});
  const [refreshing,setRefreshing] = useState(false);
  const [tab,setTab] = useState('positions');
  const [buyForm,setBuyForm] = useState({ticker:'',shares:'',sl:'',tp:'',price:null,fetching:false,err:''});
  const [sellId,setSellId] = useState(null);

  const demo = accs[activeIdx]||null;

  function switchAcc(i){ setActiveIdx(i); saveActive(i); setSellId(null); setBuyForm({ticker:'',shares:'',sl:'',tp:'',price:null,fetching:false,err:''}); setPrices({}); }

  function createAcc(bal){
    if(accs.length>=3) return;
    const name = newName.trim()||(D.startLabel[[1000,3000,5000,10000].indexOf(bal)]||('Hisob '+(accs.length+1)));
    const today = new Date().toISOString().split('T')[0];
    const acc = {id:Date.now(),name,startBal:bal,cash:bal,positions:[],history_trades:[],history:[{d:today,v:bal}]};
    const next = [...accs,acc];
    setAccs(next); saveAccs(next);
    const ni=next.length-1; setActiveIdx(ni); saveActive(ni);
    setShowNew(false); setNewName('');
  }

  function deleteAcc(i){
    if(!window.confirm('"'+(accs[i]?.name||'Hisob')+'" hisobini o\'chirasizmi?')) return;
    const next=accs.filter((_,idx)=>idx!==i); setAccs(next); saveAccs(next);
    const ni=Math.max(0,Math.min(activeIdx,next.length-1)); setActiveIdx(ni); saveActive(ni);
  }

  function updateDemo(updated){ const next=accs.map((a,i)=>i===activeIdx?updated:a); setAccs(next); saveAccs(next); }

  function snapshotEquity(d,px){
    const unr=(d.positions||[]).reduce((s,p)=>{ const cp=px[p.ticker]||p.buyPrice; return s+(cp-p.buyPrice)*p.shares; },0);
    const tot=d.cash+unr+(d.positions||[]).reduce((s,p)=>s+p.buyPrice*p.shares,0);
    const today=new Date().toISOString().split('T')[0];
    const h=[...(d.history||[])];
    if(h.length>0&&h[h.length-1].d===today) h[h.length-1].v=Math.round(tot*100)/100;
    else h.push({d:today,v:Math.round(tot*100)/100});
    if(h.length>90) h.shift();
    return {...d,history:h};
  }

  async function refreshPrices(){
    if(!demo?.positions?.length) return;
    setRefreshing(true);
    const tickers=[...new Set(demo.positions.map(p=>p.ticker))];
    const px={};
    for(const sym of tickers){ try{ const r=await fetch('/api/lookup?sym='+sym); const d=await r.json(); if(d.price) px[sym]=d.price; }catch{} }
    setPrices(px);
    let updated={...demo};
    const closed=[];
    updated.positions=(demo.positions||[]).filter(pos=>{
      const cp=px[pos.ticker]; if(!cp) return true;
      if(pos.sl&&cp<=pos.sl){ closed.push({...pos,closePrice:cp,closeDate:new Date().toISOString().split('T')[0],reason:'Stop Loss',pnl:(cp-pos.buyPrice)*pos.shares}); return false; }
      if(pos.tp&&cp>=pos.tp){ closed.push({...pos,closePrice:cp,closeDate:new Date().toISOString().split('T')[0],reason:'Take Profit',pnl:(cp-pos.buyPrice)*pos.shares}); return false; }
      return true;
    });
    if(closed.length>0){
      updated.cash=(updated.cash||0)+closed.reduce((s,t)=>s+t.closePrice*t.shares,0);
      updated.history_trades=[...(demo.history_trades||[]),...closed];
      alert(closed.map(t=>t.ticker+' '+t.reason+' — '+(t.pnl>=0?'+':'')+t.pnl.toFixed(2)+'$').join('\n'));
    }
    updated=snapshotEquity(updated,px); updateDemo(updated); setRefreshing(false);
  }

  React.useEffect(()=>{ if(!demo?.positions?.length) return; const t=setInterval(()=>refreshPrices(),30000); return ()=>clearInterval(t); },[demo,activeIdx]);

  async function fetchBuyPrice(){
    const sym=buyForm.ticker.trim().toUpperCase(); if(!sym) return;
    setBuyForm(f=>({...f,fetching:true,err:''}));
    try{
      const r=await fetch('/api/lookup?sym='+sym); const d=await r.json();
      if(d.price) setBuyForm(f=>({...f,price:d.price,fetching:false,ticker:sym}));
      else setBuyForm(f=>({...f,err:d.error||'Topilmadi',fetching:false}));
    }catch{ setBuyForm(f=>({...f,err:'Server xatosi',fetching:false})); }
  }

  function executeBuy(){
    if(!demo||!buyForm.price||!buyForm.shares) return;
    const cost=buyForm.price*parseFloat(buyForm.shares);
    if(cost>demo.cash){ alert("Mablag' yetarli emas!"); return; }
    const pos={id:Date.now(),ticker:buyForm.ticker,shares:parseFloat(buyForm.shares),buyPrice:buyForm.price,buyDate:new Date().toISOString().split('T')[0],sl:buyForm.sl?parseFloat(buyForm.sl):null,tp:buyForm.tp?parseFloat(buyForm.tp):null};
    const upd=snapshotEquity({...demo,cash:demo.cash-cost,positions:[...(demo.positions||[]),pos]},{...prices,[buyForm.ticker]:buyForm.price});
    updateDemo(upd); setBuyForm({ticker:'',shares:'',sl:'',tp:'',price:null,fetching:false,err:''});
  }

  function closePosition(pos){
    if(!demo) return;
    const cp=prices[pos.ticker]||pos.buyPrice;
    const pnl=(cp-pos.buyPrice)*pos.shares;
    const trade={...pos,closePrice:cp,closeDate:new Date().toISOString().split('T')[0],reason:'Manual',pnl};
    const upd=snapshotEquity({...demo,cash:demo.cash+cp*pos.shares,positions:demo.positions.filter(p=>p.id!==pos.id),history_trades:[...(demo.history_trades||[]),trade]},{...prices});
    updateDemo(upd); setSellId(null);
  }

  const unrPnl=(demo?.positions||[]).reduce((s,p)=>{ const cp=prices[p.ticker]||p.buyPrice; return s+(cp-p.buyPrice)*p.shares; },0);
  const invVal=(demo?.positions||[]).reduce((s,p)=>s+p.buyPrice*p.shares,0);
  const portVal=(demo?.cash||0)+invVal+unrPnl;
  const totPnl=portVal-(demo?.startBal||0);
  const totPct=demo?.startBal?(totPnl/demo.startBal*100):0;
  const isUp=totPnl>=0;

  // Setup screen
  if(accs.length===0){
    return(
      <div style={{padding:'100px 24px',maxWidth:520,margin:'0 auto',textAlign:'center'}}>
        <div style={{fontSize:10,letterSpacing:'2px',color:C.faint,marginBottom:8}}>SAVURA INVEST</div>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:26,color:C.text,margin:'0 0 8px'}}>{D.setup}</h2>
        <p style={{color:C.dim,fontSize:13,marginBottom:8,lineHeight:1.6}}>Haqiqiy pul yo'q — real narxlarda mashq qiling.</p>
        <p style={{color:C.faint,fontSize:11,marginBottom:24}}>Brauzerda saqlanadi. 3 tagacha hisob ocha olasiz.</p>
        <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Hisob nomi (ixtiyoriy: Agressiv, Konservativ...)"
          style={{width:'100%',background:'rgba(12,20,38,.85)',border:`1px solid ${C.border}`,borderRadius:10,color:C.text,padding:'11px 14px',fontSize:13,outline:'none',marginBottom:14,boxSizing:'border-box',fontFamily:"'Sora',sans-serif"}}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[1000,3000,5000,10000].map((amt,idx)=>(
            <button key={amt} onClick={()=>createAcc(amt)}
              style={{background:C.card,border:`2px solid ${C.border}`,borderRadius:14,padding:'16px 12px',cursor:'pointer',transition:'all .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.background='rgba(47,125,246,0.1)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,fontSize:22,color:C.blueLt}}>${amt.toLocaleString()}</div>
              <div style={{fontSize:11.5,color:C.dim,marginTop:3}}>{D.startLabel[idx]}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:'80px 16px 60px',maxWidth:1060,margin:'0 auto'}}>

      {/* Account tabs */}
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        {accs.map(function(acc,i){
          const av=acc.cash+(acc.positions||[]).reduce(function(s,p){return s+p.buyPrice*p.shares;},0);
          const pct=(av-acc.startBal)/acc.startBal*100;
          const active=i===activeIdx;
          return(
            <div key={acc.id} onClick={()=>switchAcc(i)}
              style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:12,cursor:'pointer',
                background:active?'rgba(47,125,246,0.12)':'rgba(255,255,255,0.03)',
                border:`1.5px solid ${active?C.blue:C.border}`,transition:'all .2s'}}>
              <div>
                <div style={{fontSize:12.5,fontWeight:active?700:400,color:active?C.text:C.dim}}>{acc.name}</div>
                <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>
                  <span style={{color:C.faint}}>${av.toFixed(0)}</span>
                  <span style={{marginLeft:6,color:pct>=0?C.green:C.red,fontWeight:600}}>{pct>=0?'+':''}{pct.toFixed(1)}%</span>
                </div>
              </div>
              <button onClick={function(e){e.stopPropagation();deleteAcc(i);}}
                style={{background:'transparent',border:'none',color:C.faint,cursor:'pointer',fontSize:16,padding:'0 2px',lineHeight:1,marginLeft:2}}>×</button>
            </div>
          );
        })}

        {accs.length<3&&!showNew&&(
          <button onClick={()=>setShowNew(true)}
            style={{padding:'8px 14px',borderRadius:12,background:'transparent',border:`1.5px dashed ${C.border}`,color:C.faint,cursor:'pointer',fontSize:12.5,fontWeight:600,transition:'all .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.green;e.currentTarget.style.color=C.greenLt;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.faint;}}>
            + Yangi hisob
          </button>
        )}

        {showNew&&(
          <div style={{display:'flex',gap:7,alignItems:'center',flexWrap:'wrap',padding:'8px 12px',background:C.card,border:`1px solid ${C.border}`,borderRadius:12}}>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Hisob nomi"
              style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:'6px 10px',fontSize:12,outline:'none',width:130,fontFamily:"'Sora',sans-serif"}}/>
            {[1000,3000,5000,10000].map(function(amt){
              return(
                <button key={amt} onClick={()=>createAcc(amt)}
                  style={{background:'rgba(47,125,246,0.1)',border:`1px solid rgba(47,125,246,0.3)`,borderRadius:8,color:C.blueLt,fontSize:11.5,fontWeight:600,padding:'5px 10px',cursor:'pointer'}}>
                  ${amt.toLocaleString()}
                </button>
              );
            })}
            <button onClick={()=>setShowNew(false)}
              style={{background:'transparent',border:`1px solid ${C.border}`,borderRadius:8,color:C.faint,fontSize:12,padding:'5px 10px',cursor:'pointer'}}>×</button>
          </div>
        )}
      </div>

      {/* Portfolio header + chart */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:'18px 20px',marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12,marginBottom:14}}>
          <div>
            <div style={{fontSize:10,letterSpacing:'2px',color:C.faint,marginBottom:4}}>{demo.name.toUpperCase()}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,fontSize:'clamp(24px,4vw,38px)',color:C.text,lineHeight:1}}>
              ${portVal.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginTop:6,flexWrap:'wrap'}}>
              <span style={{fontSize:16,fontWeight:700,color:isUp?C.green:C.red}}>{isUp?'▲':'▼'} {isUp?'+':''}{totPct.toFixed(2)}%</span>
              <span style={{fontSize:14,color:isUp?C.green:C.red}}>{isUp?'+':''}{totPnl.toFixed(2)}$</span>
              <span style={{fontSize:11,color:C.faint}}>{D.start}: ${demo.startBal.toLocaleString()}</span>
            </div>
          </div>
          <div style={{display:'flex',gap:14,flexWrap:'wrap',alignItems:'flex-start'}}>
            {[[D.cash,demo.cash.toFixed(2)+'$',C.blueLt],[D.invest,invVal.toFixed(2)+'$',C.amber],[D.opnl,(unrPnl>=0?'+':'')+unrPnl.toFixed(2)+'$',unrPnl>=0?C.green:C.red]].map(function(item){
              return(
                <div key={item[0]} style={{textAlign:'right'}}>
                  <div style={{fontSize:10,color:C.faint}}>{item[0]}</div>
                  <div style={{fontSize:13,fontWeight:700,color:item[2],fontFamily:"'JetBrains Mono',monospace"}}>{item[1]}</div>
                </div>
              );
            })}
            <button onClick={()=>refreshPrices()} disabled={refreshing}
              style={{background:'rgba(47,125,246,0.1)',border:`1px solid ${C.border}`,borderRadius:8,color:C.blueLt,fontSize:11.5,padding:'6px 12px',cursor:'pointer'}}>
              {refreshing?'...':D.refresh}
            </button>
          </div>
        </div>
        <div style={{background:'rgba(0,0,0,0.2)',borderRadius:12,padding:'10px 8px 4px'}}>
          <EquityChart history={demo.history} startBal={demo.startBal}/>
        </div>
      </div>

      {/* Two columns */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:14,alignItems:'start'}}>

        {/* Buy form */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:'18px'}}>
          <div style={{fontSize:13.5,fontWeight:700,color:C.text,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
            <span style={{color:C.green}}>▲</span>{D.buyTitle}
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>{D.ticker}</div>
            <div style={{display:'flex',gap:6}}>
              <input value={buyForm.ticker}
                onChange={e=>setBuyForm(f=>({...f,ticker:e.target.value.toUpperCase(),price:null,err:''}))}
                onKeyDown={e=>e.key==='Enter'&&fetchBuyPrice()}
                placeholder="AAPL"
                style={{flex:1,background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:'8px 10px',fontSize:15,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,outline:'none'}}/>
              <button onClick={fetchBuyPrice} disabled={buyForm.fetching||!buyForm.ticker}
                style={{background:`linear-gradient(135deg,${C.blue},${C.green})`,border:'none',borderRadius:8,color:'#fff',fontSize:12,fontWeight:700,padding:'0 14px',cursor:'pointer'}}>
                {buyForm.fetching?'...':(D.fetchBtn||'Narx')}
              </button>
            </div>
            {buyForm.err&&<div style={{fontSize:11,color:C.red,marginTop:4}}>{buyForm.err}</div>}
          </div>
          {buyForm.price&&(
            <div style={{background:'rgba(47,125,246,0.08)',border:`1px solid rgba(47,125,246,0.2)`,borderRadius:10,padding:'9px 12px',marginBottom:12}}>
              <div style={{fontSize:10,color:C.faint}}>Joriy narx</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,fontSize:22,color:C.blueLt}}>${buyForm.price.toFixed(2)}</div>
            </div>
          )}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10.5,color:C.faint,marginBottom:4}}>{D.qty}</div>
            <input type="number" value={buyForm.shares} onChange={e=>setBuyForm(f=>({...f,shares:e.target.value}))} placeholder="10" min="1"
              style={{width:'100%',background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:'8px 10px',fontSize:13,outline:'none',boxSizing:'border-box'}}/>
            {buyForm.price&&buyForm.shares&&(
              <div style={{fontSize:11,color:C.dim,marginTop:3}}>
                {D.total}: <b style={{color:C.text}}>${(buyForm.price*parseFloat(buyForm.shares||0)).toFixed(2)}</b>
                {'  '}({D.cash}: <span style={{color:demo.cash<buyForm.price*parseFloat(buyForm.shares||0)?C.red:C.green}}>${demo.cash.toFixed(0)}</span>)
              </div>
            )}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
            <div>
              <div style={{fontSize:10.5,color:C.red,marginBottom:4}}>● {D.sl}</div>
              <input type="number" value={buyForm.sl} onChange={e=>setBuyForm(f=>({...f,sl:e.target.value}))}
                placeholder={buyForm.price?(buyForm.price*0.95).toFixed(2):'—'}
                style={{width:'100%',background:'rgba(229,72,77,0.06)',border:`1px solid rgba(229,72,77,0.25)`,borderRadius:8,color:C.text,padding:'8px 10px',fontSize:13,outline:'none'}}/>
            </div>
            <div>
              <div style={{fontSize:10.5,color:C.green,marginBottom:4}}>● {D.tp}</div>
              <input type="number" value={buyForm.tp} onChange={e=>setBuyForm(f=>({...f,tp:e.target.value}))}
                placeholder={buyForm.price?(buyForm.price*1.10).toFixed(2):'—'}
                style={{width:'100%',background:'rgba(55,178,77,0.06)',border:`1px solid rgba(55,178,77,0.25)`,borderRadius:8,color:C.text,padding:'8px 10px',fontSize:13,outline:'none'}}/>
            </div>
          </div>
          {buyForm.price&&buyForm.sl&&buyForm.tp&&(
            <div style={{background:'rgba(0,0,0,0.2)',borderRadius:8,padding:'8px 10px',marginBottom:12,fontSize:11.5,color:C.dim}}>
              {D.rr}: <b style={{color:C.text}}>{(((parseFloat(buyForm.tp)-buyForm.price)/(buyForm.price-parseFloat(buyForm.sl)))||0).toFixed(1)}x</b>
              {'  '}
              <span style={{color:C.red}}>{D.maxLoss}: -{((buyForm.price-parseFloat(buyForm.sl))*parseFloat(buyForm.shares||0)).toFixed(2)}$</span>
            </div>
          )}
          <button onClick={executeBuy} disabled={!buyForm.price||!buyForm.shares||parseFloat(buyForm.shares)<=0}
            style={{width:'100%',background:buyForm.price&&buyForm.shares?`linear-gradient(135deg,${C.blue},${C.green})`:'rgba(255,255,255,0.05)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:14,padding:'12px',cursor:buyForm.price&&buyForm.shares?'pointer':'default',boxSizing:'border-box'}}>
            {D.buyBtn}
          </button>
          <div style={{fontSize:10.5,color:C.faint,textAlign:'center',marginTop:8}}>{D.disclaimer}</div>
        </div>

        {/* Assets */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:'18px'}}>
          <div style={{display:'flex',gap:6,marginBottom:14,background:'rgba(0,0,0,0.2)',borderRadius:10,padding:4,width:'fit-content'}}>
            {[['positions',D.assets+' ('+(demo.positions||[]).length+')'],['history',D.histTab+' ('+(demo.history_trades||[]).length+')']].map(function(item){
              const k=item[0]; const l=item[1];
              return(
                <button key={k} onClick={()=>setTab(k)}
                  style={{background:tab===k?`linear-gradient(135deg,${C.blue},${C.green})`:'transparent',border:'none',borderRadius:8,color:tab===k?'#fff':C.dim,fontWeight:tab===k?700:400,padding:'7px 13px',cursor:'pointer',fontSize:12}}>
                  {l}
                </button>
              );
            })}
          </div>

          {tab==='positions'&&(
            (demo.positions||[]).length===0
              ?<div style={{padding:'32px',textAlign:'center',color:C.faint,fontSize:13}}>{D.noPos}</div>
              :<div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead>
                    <tr style={{borderBottom:`1px solid ${C.border}`}}>
                      {[D.colTicker,D.colQty,D.colEntry,D.colCur,D.colPnl,D.colPct,D.colSl,D.colTp,''].map(function(h){
                        return <th key={h} style={{padding:'7px 6px',color:C.faint,fontWeight:600,textAlign:'left',fontSize:10.5,whiteSpace:'nowrap'}}>{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {(demo.positions||[]).map(function(pos){
                      const cp=prices[pos.ticker]||pos.buyPrice;
                      const pnl=(cp-pos.buyPrice)*pos.shares;
                      const pct=(cp-pos.buyPrice)/pos.buyPrice*100;
                      const col=pnl>=0?C.green:C.red;
                      return(
                        <tr key={pos.id} style={{borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                          <td style={{padding:'8px 6px',fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:C.blueLt}}>{pos.ticker}</td>
                          <td style={{padding:'8px 6px',color:C.text}}>{pos.shares}</td>
                          <td style={{padding:'8px 6px',color:C.dim,fontSize:11}}>${pos.buyPrice.toFixed(2)}</td>
                          <td style={{padding:'8px 6px',color:col,fontSize:11}}>${cp.toFixed(2)}</td>
                          <td style={{padding:'8px 6px',fontWeight:700,color:col,fontSize:11}}>{pnl>=0?'+':''}{pnl.toFixed(2)}$</td>
                          <td style={{padding:'8px 6px',fontWeight:700,color:col,fontSize:11}}>{pct>=0?'+':''}{pct.toFixed(1)}%</td>
                          <td style={{padding:'8px 6px',color:C.red,fontSize:10.5}}>{pos.sl?'$'+pos.sl:'—'}</td>
                          <td style={{padding:'8px 6px',color:C.green,fontSize:10.5}}>{pos.tp?'$'+pos.tp:'—'}</td>
                          <td style={{padding:'8px 6px'}}>
                            {sellId===pos.id
                              ?<div style={{display:'flex',gap:4}}>
                                <button onClick={()=>closePosition(pos)} style={{background:'rgba(229,72,77,0.15)',border:`1px solid ${C.red}`,borderRadius:6,color:C.red,fontSize:10.5,padding:'3px 7px',cursor:'pointer'}}>{D.confirm}</button>
                                <button onClick={()=>setSellId(null)} style={{background:'transparent',border:`1px solid ${C.border}`,borderRadius:6,color:C.faint,fontSize:10.5,padding:'3px 7px',cursor:'pointer'}}>{D.cancel}</button>
                              </div>
                              :<button onClick={()=>setSellId(pos.id)} style={{background:'rgba(229,72,77,0.1)',border:`1px solid rgba(229,72,77,0.3)`,borderRadius:7,color:C.red,fontSize:11,padding:'4px 8px',cursor:'pointer'}}>{D.sell}</button>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
          )}

          {tab==='history'&&(
            (demo.history_trades||[]).length===0
              ?<div style={{padding:'32px',textAlign:'center',color:C.faint,fontSize:13}}>{D.noHist}</div>
              :<div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5}}>
                  <thead>
                    <tr style={{borderBottom:`1px solid ${C.border}`}}>
                      {[D.colTicker,D.histDate,D.histEntry,D.histExit,D.histQty,D.histPnl,D.histReason].map(function(h){
                        return <th key={h} style={{padding:'7px 6px',color:C.faint,fontWeight:600,textAlign:'left',fontSize:10.5}}>{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[...(demo.history_trades||[])].reverse().map(function(t){
                      return(
                        <tr key={t.id} style={{borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                          <td style={{padding:'7px 6px',fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:C.blueLt}}>{t.ticker}</td>
                          <td style={{padding:'7px 6px',color:C.faint,fontSize:10.5}}>{t.closeDate}</td>
                          <td style={{padding:'7px 6px',color:C.dim,fontSize:10.5}}>${t.buyPrice.toFixed(2)}</td>
                          <td style={{padding:'7px 6px',color:C.dim,fontSize:10.5}}>${(t.closePrice||t.buyPrice).toFixed(2)}</td>
                          <td style={{padding:'7px 6px',color:C.text}}>{t.shares}</td>
                          <td style={{padding:'7px 6px',fontWeight:700,color:t.pnl>=0?C.green:C.red}}>{t.pnl>=0?'+':''}{t.pnl.toFixed(2)}$</td>
                          <td style={{padding:'7px 6px',fontSize:10.5}}>{t.reason}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function App(){
  const [page,setPage]=useState("home");
  const [lang,setLang]=useState("uz");
  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Manrope',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;} ::selection{background:#2f7df6;color:#fff;} a{text-decoration:none;} button{font-family:inherit;}
        @keyframes spin{to{transform:rotate(360deg);}}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#060a14;} ::-webkit-scrollbar-thumb{background:#2f7df6;border-radius:2px;}
      `}</style>
      <NavBar page={page} setPage={setPage} lang={lang} setLang={setLang}/>
      {page==="home"&&<><HeroSection setPage={setPage} lang={lang}/><FinanceIllustration/><FeaturesSection setPage={setPage} lang={lang}/></>}
      {page==="tool"&&<FundamentalTool lang={lang} setLang={setLang}/>}
      {page==="course"&&<CoursePage lang={lang}/>}
      {page==="about"&&<AboutPage lang={lang}/>}
      {page==="journal"&&<JournalPage lang={lang}/>}
      {page==="demo"&&<DemoPage lang={lang}/>}
      <ChatWidget lang={lang}/>
      <Footer setPage={setPage} lang={lang}/>
    </div>
  );
}