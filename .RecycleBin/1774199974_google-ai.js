/*
@ author: Herza
@ type : CommonJS
@ ========> Info <=========
@ github: https://github.com/herzonly
@ wa_channel: https://whatsapp.com/channel/0029VaGVOvq1iUxY6WgHLv2R
*/

//Vision AI

/* Don't forget to join NotMeBotz MD Channel

#### HERXA ####

GOOGLE AI MODE VISION
*/
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function aiVision(imagePath, prompt = '') {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = { runtime: {} };
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
  });

  const page = await context.newPage();

  try {
    await page.goto('https://www.google.com/', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    const aiModeButton = 'button[jsname="B6rgad"]';
    await page.waitForSelector(aiModeButton, { timeout: 30000 });
    await page.click(aiModeButton);
    
    await page.waitForTimeout(5000);
    
    const buffer = Buffer.from(base64Image, 'base64');
    const tempFile = path.join(__dirname, 'temp_upload_' + Date.now() + '.jpg');
    fs.writeFileSync(tempFile, buffer);
    
    const fileInput = await page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(tempFile);
    
    await page.waitForTimeout(5000);
    
    if (prompt) {
      const textareaSelector = 'textarea.ITIRGe';
      await page.waitForSelector(textareaSelector, { timeout: 30000 });
      await page.fill(textareaSelector, prompt);
      
      await page.waitForTimeout(2000);
    }
    
    const submitButton = 'button[data-xid="input-plate-send-button"]';
    await page.waitForSelector(submitButton, { timeout: 30000 });
    await page.click(submitButton);
    
    await page.waitForTimeout(15000);
    
    const responseSelector = 'ul.KsbFXc.U6u95[data-complete="true"]';
    await page.waitForSelector(responseSelector, { timeout: 60000 });
    
    const aiResponse = await page.evaluate(() => {
      const responseContainer = document.querySelector('ul.KsbFXc.U6u95[data-complete="true"]');
      if (!responseContainer) return null;
      
      const listItems = responseContainer.querySelectorAll('li');
      const results = [];
      
      listItems.forEach(li => {
        const content = li.textContent.trim();
        if (content) {
          results.push(content);
        }
      });
      
      return results.join('\n\n');
    });
    
    const fullResponse = await page.evaluate(() => {
      const mainContainer = document.querySelector('div[data-container-id="main-col"]');
      if (!mainContainer) return null;
      
      return mainContainer.innerText.trim();
    });
    
    const sourcesData = await page.evaluate(() => {
      const sources = [];
      const sourceElements = document.querySelectorAll('div.MFrAxb.BKnikc');
      
      sourceElements.forEach(el => {
        const linkEl = el.querySelector('a.NDNGvf');
        const titleEl = el.querySelector('div.Nn35F');
        const descEl = el.querySelector('span.vhJ6Pe');
        
        if (linkEl && titleEl) {
          sources.push({
            title: titleEl.textContent.trim(),
            description: descEl ? descEl.textContent.trim() : '',
            url: linkEl.href
          });
        }
      });
      
      return sources;
    });
    
    fs.unlinkSync(tempFile);
    
    await browser.close();
    
    return {
      success: true,
      response: aiResponse,
      fullResponse: fullResponse,
      sources: sourcesData
    };
    
  } catch (error) {
    await browser.close();
    throw error;
  }
}

aiVision('./image.jpg', 'Jelaskan gambar ini secara detail')
  .then(result => console.log(result))
  .catch(error => console.error(error));

 /*This Code Uploaded By NotMeBotz - MD, DO NOT DELETE WM | | Saturday, 20 December 2025 || 10:20:12 WIB */