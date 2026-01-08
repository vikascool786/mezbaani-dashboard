const { ipcMain, BrowserWindow } = require("electron");
const path = require("path");

function generateReceiptHTML(data) {
    return `
  <html>
    <body style="font-family: monospace; width: 280px">
      <h3 style="text-align:center">${data.restaurant.name}</h3>
      <p style="text-align:center">${data.restaurant.address}</p>
      <hr/>
      <p>Bill: ${data.order.billNo}</p>
      <p>Table: ${data.order.table}</p>
      <hr/>
      ${data.items.map(
        i => `<div>${i.qty} x ${i.name} = ₹${i.qty * i.price}</div>`
    ).join("")}
      <hr/>
      <strong>Total: ₹${data.totals.grandTotal}</strong>
    </body>
  </html>
  `;
}

ipcMain.handle("print:receipt", async (_e, receiptData) => {
    const win = new BrowserWindow({
        width: 300,       // thermal width
        height: 600,
        show: false,
        webPreferences: {
            sandbox: true
        }
    });

    const receiptHtml = generateReceiptHTML(receiptData);

    await win.loadURL(
        "data:text/html;charset=utf-8," + encodeURIComponent(receiptHtml)
    );

    win.webContents.print(
        { silent: true, printBackground: true },
        (success, error) => {
            if (!success) console.error(error);
            win.close();
        }
    );

    return true;
});