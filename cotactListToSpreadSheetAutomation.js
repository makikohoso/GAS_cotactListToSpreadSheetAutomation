function cotactListToSpreadSheetAutomation() {
  var query = 'subject:"お問い合わせメールタイトル" is:unread -label:転記済み';
  var threads = GmailApp.search(query);

  var sheet = SpreadsheetApp.getActive().getSheetByName("シート名");

  //　【 会社名 】と囲われている場合、その後に続く文字列を取得する※お問い合わせメールの体裁によって変える
  function extractInfo(body, label) {
    var match = body.match(new RegExp(`【\\s*${label}\\s*】\\s*(.*)`));
    return match ? match : "";
  }

  threads.forEach(function (thread) {
    var messages = thread.getMessages();

    messages.forEach(function (message) {
      // 条件に一致するメッセージだけを処理
      if (
        message.isUnread() &&
        message.getSubject() === "お問い合わせメールタイトル"
      ) {
        var date = Utilities.formatDate(
          message.getDate(),
          "Asia/Tokyo",
          "yyyy-MM-dd"
        );
        var plainBody = message.getPlainBody();

        // 【 会社名 】など取得したい属性名を入れる
        var company = extractInfo(plainBody, "会社名");
        var name = extractInfo(plainBody, "お名前");
        var email = extractInfo(plainBody, "Email");
        var tel = extractInfo(plainBody, "電話番号");

        // 転記したい列番号を入れる
        var lastRow = sheet.getLastRow() + 1;
        sheet.getRange(lastRow, 1).setValue(date);
        sheet.getRange(lastRow, 3).setValue(company[1]);
        sheet.getRange(lastRow, 4).setValue(name[1]);
        sheet.getRange(lastRow, 5).setValue(email[1]);
        sheet.getRange(lastRow, 6).setValue(tel[1]);

        // メールを既読にして転記済みラベルを付ける
        message.markRead();
        var label = GmailApp.getUserLabelByName("転記済み");
        thread.addLabel(label);
      }
    });
  });
}
