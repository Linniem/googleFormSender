const puppeteer = require('puppeteer');

// 測試用的表單
const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSekOf5PrAfZbzPoGBglxqzcL0Flbrau91gsuz-h7SwGe5ju3w/viewform';

const selector = {
    container: '.freebirdFormviewerViewNumberedItemContainer>[jsmodel]',
    title: '.freebirdFormviewerComponentsQuestionBaseTitle',
    inputType: '[jscontroller]>[jscontroller]',
};

const questionAnswers = new Map([
    ['問題一、請填您的姓名？(本名)', '我的名字'],
    ['問題二、今日量測體溫溫度？', '溫度'],
    ['問題三、目前您有沒有身體不舒服或發燒症狀？', '無'],
    ['問題四、承上題說明？(例如：其他-我牙痛新竹牙醫就診)', '無'],
    ['問題五、目前您家人中有沒有身體不舒服或發燒症狀？', '沒有'],
    ['問題六、承上題說明？(例如：我媽，昨天去診所看喉嚨痛、我爸，昨天因車禍擦撞有至醫院就診)', '無'],
    ['問題七、今日上班有無搭乘大眾交通工具？(可複選)', '無'],
    ['問題八、承上題說明。(例如：我從木柵搭捷運到台北車站，再轉台鐵火車從台北車站到新竹火車站)', '無'],
    ['問題九、近三日您或週遭親密家人朋友有無進出公共場所？(可複選)', '無'],
    ['問題十、承上題說明。(例如：我5/17去忠孝大潤發)', '無'],
    ['問題十一、請問您最近是否有接觸確診者？', '否'],
    ['問題十二、請問您或您的同住家人是否有接獲通知需要居家檢疫？', '否'],
    ['問題十三、您或週遭親密家人朋友有無從國外返台，並正在進行居家檢疫或自主健康管理？(與您的關係、期間、地點或特殊狀況務必詳述)', '無'],
]);

const questionType = {
    text: 'freebirdFormviewerComponentsQuestionTextRoot',
    checkBox: 'freebirdFormviewerComponentsQuestionCheckboxRoot',
    radio: 'freebirdFormviewerComponentsQuestionRadioRoot',
};

const fill = {
    /**
     * @param {puppeteer.ElementHandle<Element>} handle containerHandle
     * @param {string} input answer to textBox
     */
    text: async (handle, input) => {
        const inputHandle = await handle.$('input.quantumWizTextinputPaperinputInput');
        await inputHandle.type(input);
    },

    /**
     * @param {puppeteer.ElementHandle<Element>} handle containerHandle
     * @param {string} input 
     */
    checkBox: async (handle, input) => {
        await handle.$eval(`[data-answer-value="${input}"] .quantumWizTogglePapercheckboxCheckMark`, node => {
            node.click();
        });
    },

    /**
     * @param {puppeteer.ElementHandle<Element>} handle containerHandle
     * @param {string} input 
     */
    radio: async (handle, input) => { },
};


(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const formPage = await browser.newPage();
    await formPage.goto(formUrl);

    const containerHandles = await formPage.$$(selector.container);
    for (const containerHandle of containerHandles) {
        /** @type {string} */
        const rawTitleText = await containerHandle.$eval(selector.title, e => e.innerText);
        const question = rawTitleText.replace('*', '').trim();
        const answer = questionAnswers.get(question);

        const className = await containerHandle.$eval(selector.inputType, e => e.className);
        switch (className) {
            case questionType.checkBox:
                await fill.checkBox(containerHandle, answer);
                break;

            case questionType.radio:
                break;

            case questionType.text:
                await fill.text(containerHandle, answer);
                break;

            default:
                break;
        }
    }

    // await browser.close();
})();