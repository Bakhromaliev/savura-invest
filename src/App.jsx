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
    rq:["Mali sağlık göstergeleri ortalama veya üstünde mi?","Karlılık göstergeleri ortalama veya üstünde mi?","Verimlilik göstergeleri ortalama veya üstünde mi?","Büyüme göstergeleri ortalama veya üstünde mi?","F/K piyasa ortalamasına yakın veya altında mı?","Şirket geçen çeyrek ve yılda karlı mıydı?","Operasyonel nakit akışı pozitif miydi?","Beta 1.5'ten küçük mü?","Piyasa değeri 2 milyar $ veya fazla mı?","Savunmacı sektörde mi?","Sektöründe ilk 10'da mı?","Jeopolitik/hukuki sorunlardan uzak mı?","Son 5 yılda S&P 500'ü geçti mi?","Beklenmedik riskler (her zaman Hayır)","Beklenmedik riskler (her zaman Hayır)"],
  },
  ru:{
    tagline:"ФУНДАМЕНТАЛЬНЫЙ АНАЛИЗ \u00b7 РЫНОК США",
    h1:"Какое фундаментальное", h2:"состояние акции?",
    sub:"Введите тикер \u2014 полный фундаментальный анализ по методологии курса.",
    ph:"напр. AAPL, TSLA, KO...", btn:"Анализ", btnL:"Анализ...",
    loading:"Загрузка реальных данных с Finnhub\u2026",
    errNF:"Акция не найдена.",
    errLive:"Добавьте ключ Finnhub (справа вверху). Примеры: AAPL MSFT NVDA TSLA KO JPM.",
    riskT:"УРОВЕНЬ РИСКА", riskTag:"модель 15 вопросов",
    noQ:(n)=>`${n} ответов "нет"`, showQ:"Показать 15 вопросов \u25bc", hideQ:"Скрыть \u25b2",
    fundT:"ФУНДАМЕНТАЛ \u2014 5 КАТЕГОРИЙ", sample:"пример",
    note:"Данные: stockanalysis.com \u00b7 Методология Savura Invest \u00b7 Не является инвестиционным советом.",
    rI:"Положит.", rO:"Среднее", rS:"Отрицат.",
    lL:"НИЗКИЙ", lM:"СРЕДНИЙ", lH:"ВЫСОКИЙ", lVH:"ОЧЕНЬ ВЫСОКИЙ",
    qa:"Да", qn:"Нет",
    cats:{growth:"Рост",valuation:"Оценка",profitability:"Рентабельность",health:"Фин. здоровье",efficiency:"Эффективность"},
    rq:["Показатели фин. здоровья ср. уровня или выше?","Показатели рентабельности ср. ур. или выше?","Показатели эффективности ср. ур. или выше?","Показатели роста ср. ур. или выше?","P/E близко к среднерыночному или ниже?","Компания была прибыльной в прошлом квартале/году?","Операционный ден.поток положительный?","Бета меньше 1.5?","Рын.кап. $2 млрд или больше?","В защитном секторе?","В топ-10 отрасли?","Свободна от геопол. проблем?","Опередила S&P 500 за 5 лет?","Неожиданные риски (всегда Нет)","Неожиданные риски (всегда Нет)"],
  },
};

const SITE_T={
  uz:{nav:{home:"Bosh sahifa",tool:"Fundamental Tahlil",course:"Aksiyalar savdosi kursi",about:"Biz haqimizda",erp:"Savura ERP"},
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
  en:{nav:{home:"Home",tool:"Fundamental Analysis",course:"Stock Trading Course",about:"About Us",erp:"Savura ERP"},
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
  tr:{nav:{home:"Ana Sayfa",tool:"Temel Analiz",course:"Hisse Senedi Kursu",about:"Hakkımızda",erp:"Savura ERP"},
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
  const links=[{id:"home",label:sn.home},{id:"tool",label:sn.tool},{id:"course",label:sn.course},{id:"about",label:sn.about},{id:"erp",label:sn.erp,ext:"https://savuraerp.com"}];
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

// ─── Fundamental Tool (React.createElement — no JSX parsing issues) ──────────
var TOOL_LANGS=[{k:"uz",l:"O'Z"},{k:"en",l:"EN"},{k:"tr",l:"TR"},{k:"ru",l:"RU"},{k:"ar",l:"AR"}];

function doFetch(sym,cb){
  fetch("/api/stock?symbol="+sym)
  .then(function(r){return r.json();})
  .then(function(j){
    if(j.found===false){cb({found:false},null);return;}
    if(j.error){cb(null,j.error);return;}
    cb(j,null);
  })
  .catch(function(e){cb(null,e.message);});
}

function FundamentalTool(props){
  var lang=props.lang; var setLang=props.setLang;
  var t=LANG[lang]||LANG.uz;
  var ts=useState(""); var ticker=ts[0]; var setTicker=ts[1];
  var ls=useState(false); var loading=ls[0]; var setLoading=ls[1];
  var es=useState(""); var error=es[0]; var setError=es[1];
  var ds=useState(null); var data=ds[0]; var setData=ds[1];
  function run(sym){
    var tk=(sym||ticker).trim().toUpperCase();
    if(!tk)return;
    setTicker(tk);setLoading(true);setError("");setData(null);
    var inSample=!!SAMPLE[tk];
    if(inSample){setData(Object.assign({},SAMPLE[tk],{ticker:tk,_sample:true}));setLoading(false);}
    doFetch(tk,function(res,err){
      if(res&&res.found===false){if(!inSample)setError(t.errNF);setLoading(false);return;}
      if(res&&res.ticker){setData(Object.assign({},res,{_live:true}));setLoading(false);return;}
      if(!inSample){setError(t.errLive+(err?" - "+err:""));setLoading(false);}
    });
  }
  var R=React.createElement;
  var B=function(x,s,c){return R("button",{onClick:x,style:s},c);};
  return R("div",{style:{padding:"85px 24px 60px",maxWidth:940,margin:"0 auto"}},
    R("div",{style:{textAlign:"center",marginBottom:32}},
      R("div",{style:{fontSize:10.5,letterSpacing:"2px",color:C.faint,fontFamily:"'JetBrains Mono',monospace",marginBottom:10}},"VOSITA"),
      R("h1",{style:{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:"clamp(22px,4vw,38px)",lineHeight:1.1,margin:"0 0 8px",color:C.text}},
        t.h1,R("br",null),
        R("span",{style:{background:"linear-gradient(90deg,"+C.blueLt+","+C.greenLt+")",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}},t.h2)
      ),
      R("p",{style:{color:C.dim,fontSize:14,maxWidth:460,margin:"12px auto 0"}},t.sub)
    ),
    R("div",{style:{display:"flex",gap:6,justifyContent:"center",marginBottom:16,flexWrap:"wrap"}},
      TOOL_LANGS.map(function(l){return R("button",{key:l.k,onClick:function(){setLang(l.k);},style:{background:lang===l.k?"linear-gradient(135deg,"+C.blue+","+C.green+")":"transparent",border:"1px solid "+(lang===l.k?"transparent":C.border),color:lang===l.k?"#fff":C.dim,borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}},l.l);})
    ),
    R("div",{style:{display:"flex",gap:10,maxWidth:540,margin:"0 auto 14px"}},
      R("input",{value:ticker,onChange:function(e){setTicker(e.target.value.toUpperCase());},onKeyDown:function(e){if(e.key==="Enter")run();},placeholder:t.ph,style:{flex:1,background:"rgba(12,20,38,.85)",border:"1px solid "+C.border,borderRadius:12,color:C.text,padding:"14px 18px",fontSize:16,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"1px",outline:"none"}}),
      R("button",{onClick:function(){run();},disabled:loading,style:{background:"linear-gradient(135deg,"+C.blue+","+C.green+")",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:15,padding:"0 22px",cursor:"pointer",fontFamily:"'Sora',sans-serif",whiteSpace:"nowrap"}},loading?t.btnL:t.btn)
    ),
    R("div",{style:{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap",marginBottom:14}},
      EX.map(function(x){return R("button",{key:x,onClick:function(){run(x);},style:{background:"transparent",border:"1px solid "+C.border,color:C.dim,borderRadius:20,padding:"5px 12px",fontSize:12,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}},x);})
    ),
    loading&&R("div",{style:{textAlign:"center",marginTop:32}},
      R("div",{style:{width:30,height:30,border:"3px solid "+C.border,borderTopColor:C.blueLt,borderRadius:"50%",margin:"0 auto",animation:"spin .8s linear infinite"}}),
      R("div",{style:{color:C.dim,fontSize:13,marginTop:10}},t.loading)
    ),
    error&&R("div",{style:{marginTop:20,textAlign:"center",color:C.amber,background:"rgba(240,169,43,.08)",border:"1px solid rgba(240,169,43,.25)",borderRadius:12,padding:"12px 16px",lineHeight:1.6,maxWidth:540,margin:"20px auto 0"}},error),
    data&&R(ToolResult,{d:data,t:t}),
    R("div",{style:{fontSize:11,color:C.faint,lineHeight:1.7,textAlign:"center",maxWidth:600,margin:"32px auto 0"}},t.note)
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
          {[[fn.home,"home"],[fn.tool,"tool"],[fn.course,"course"],[fn.about,"about"]].map(function(it){return(
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
      <Footer setPage={setPage} lang={lang}/>
    </div>
  );
}
