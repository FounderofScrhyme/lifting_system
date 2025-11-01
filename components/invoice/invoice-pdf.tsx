import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// 請求書のスタイル定義
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  header: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "bold",
    color: "#1976d2",
  },
  companyInfo: {
    marginBottom: 30,
    textAlign: "right",
    fontSize: 10,
    color: "#666",
  },
  invoiceInfo: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 5,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  invoiceDate: {
    fontSize: 12,
    marginBottom: 5,
  },
  dueDate: {
    fontSize: 12,
    color: "#d32f2f",
    fontWeight: "bold",
  },
  staffInfo: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#e3f2fd",
    borderRadius: 5,
    border: "1px solid #bbdefb",
  },
  staffInfoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1976d2",
  },
  staffInfoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  staffInfoLabel: {
    width: 80,
    fontWeight: "bold",
  },
  staffInfoValue: {
    flex: 1,
  },
  amountSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#fff3e0",
    borderRadius: 5,
    border: "2px solid #ff9800",
  },
  amountTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#e65100",
  },
  amountValue: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#d32f2f",
  },
  itemsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1976d2",
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 5,
    borderBottom: "1px solid #eee",
  },
  itemNumber: {
    width: 30,
    fontSize: 12,
    fontWeight: "bold",
  },
  itemName: {
    flex: 1,
    fontSize: 12,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: "1px solid #ddd",
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
  note: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 3,
    fontSize: 10,
    color: "#666",
  },
});

interface Staff {
  id: string;
  name: string;
  phone: string;
  address: string;
  employmentType: string;
}

interface InvoicePDFProps {
  staff: Staff;
  amount: number;
  issueDate?: string;
  siteNames: string[];
}

export const InvoicePDF = ({
  staff,
  amount,
  issueDate = new Date().toLocaleDateString("ja-JP"),
  siteNames = ["", "", ""],
}: InvoicePDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <Text style={styles.header}>請求書</Text>

        {/* 会社情報 */}
        <View style={styles.companyInfo}>
          <Text>(株)LIFTING</Text>
          <Text>〒123-4567 東京都渋谷区1-2-3</Text>
          <Text>TEL: 03-1234-5678</Text>
          <Text>Email: info@liftingsystem.co.jp</Text>
        </View>

        {/* 請求書情報 */}
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceDate}>発行日: {issueDate}</Text>
        </View>

        {/* スタッフ情報 */}
        <View style={styles.staffInfo}>
          <Text style={styles.staffInfoTitle}>請求先情報</Text>
          <View style={styles.staffInfoRow}>
            <Text style={styles.staffInfoLabel}>氏名:</Text>
            <Text style={styles.staffInfoValue}>{staff.name}</Text>
          </View>
          <View style={styles.staffInfoRow}>
            <Text style={styles.staffInfoLabel}>電話番号:</Text>
            <Text style={styles.staffInfoValue}>{staff.phone}</Text>
          </View>
          <View style={styles.staffInfoRow}>
            <Text style={styles.staffInfoLabel}>住所:</Text>
            <Text style={styles.staffInfoValue}>{staff.address}</Text>
          </View>
          <View style={styles.staffInfoRow}>
            <Text style={styles.staffInfoLabel}>雇用形態:</Text>
            <Text style={styles.staffInfoValue}>
              {staff.employmentType === "REGULAR" ? "レギュラー" : "スポット"}
            </Text>
          </View>
        </View>

        {/* 品名欄 */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>品名</Text>
          {siteNames.map((siteName, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemNumber}>{index + 1}.</Text>
              <Text style={styles.itemName}>
                {siteName || "現場名を入力してください"}
              </Text>
            </View>
          ))}
        </View>

        {/* 請求金額 */}
        <View style={styles.amountSection}>
          <Text style={styles.amountTitle}>請求金額</Text>
          <Text style={styles.amountValue}>¥{amount.toLocaleString()}</Text>
        </View>

        {/* 備考 */}
        <View style={styles.note}>
          <Text>・支払いは上記支払期限までにお願いいたします。</Text>
          <Text>
            ・ご不明な点がございましたら、お気軽にお問い合わせください。
          </Text>
        </View>

        {/* フッター */}
        <View style={styles.footer}>
          <Text>この請求書はシステムにより自動生成されました。</Text>
        </View>
      </Page>
    </Document>
  );
};
