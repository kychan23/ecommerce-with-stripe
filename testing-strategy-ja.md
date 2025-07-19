# Stripeを統合したEコマースサイトのテスト戦略

## 概要
このドキュメントでは、StripeとNext.jsを使用したEコマースアプリケーションの包括的なテスト戦略について説明します。
目標は、アプリケーションが正しく機能し、優れたユーザーエクスペリエンスを提供し、支払いを安全に処理することを確保することです。

## テストアプローチ

### 1. ユニットテスト
ユニットテストは、個々のコンポーネントを分離してテストすることに焦点を当てています。

**推奨ツール:**
- Jest: JavaScriptテストフレームワーク
- React Testing Library: Reactコンポーネントのテスト用
- @testing-library/user-event: ユーザー操作をシミュレートするため

**テスト対象コンポーネント:**
- `CartItem.js`: レンダリング、価格表示、削除機能のテスト
- `CheckoutButton.js`: 異なる状態（ローディング、エラー）、バリデーションロジックのテスト
- `ShoppingCart.js`: カート計算、空/満杯状態のテスト
- `Product.js`: 商品レンダリングと「カートに追加」機能のテスト

**CartItemのユニットテスト例:**
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import CartItem from '../components/CartItem';
import { useShoppingCart } from 'use-shopping-cart';

// useShoppingCartフックをモック
jest.mock('use-shopping-cart', () => ({
  useShoppingCart: jest.fn(),
}));

describe('CartItem', () => {
  const mockItem = {
    id: '1',
    name: 'テスト商品',
    emoji: '🍎',
    quantity: 2,
    price: 1000
  };

  const mockRemoveItem = jest.fn();

  beforeEach(() => {
    useShoppingCart.mockReturnValue({
      removeItem: mockRemoveItem,
    });
  });

  it('カートアイテムが正しくレンダリングされる', () => {
    render(<CartItem item={mockItem} />);

    expect(screen.getByText('🍎')).toBeInTheDocument();
    expect(screen.getByText(/テスト商品/)).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
    expect(screen.getByText('￥1000')).toBeInTheDocument();
  });

  it('削除ボタンをクリックするとremoveItemが呼び出される', () => {
    render(<CartItem item={mockItem} />);

    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);

    expect(mockRemoveItem).toHaveBeenCalledWith('1');
  });
});
```

### 2. 統合テスト
統合テストは、複数のコンポーネントが正しく連携して動作することを検証します。

**推奨ツール:**
- Jest
- React Testing Library
- Mock Service Worker (MSW): APIコールのモック用

**テスト対象シナリオ:**
- 商品をカートに追加し、ショッピングカートに表示されることを確認
- アイテムの追加/削除時にカート合計が正しく更新される
- カートからStripeリダイレクトまでのチェックアウトフロー

**統合テストの例:**
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider } from 'use-shopping-cart';
import Product from '../components/Product';
import ShoppingCart from '../components/ShoppingCart';

// Stripe環境変数をモック
const mockEnv = {
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'test_key',
  NEXT_PUBLIC_URL: 'http://localhost:3000'
};

describe('ショッピングフロー', () => {
  beforeEach(() => {
    // 環境変数のセットアップ
    process.env = { ...process.env, ...mockEnv };
  });

  it('商品をカートに追加し、カート表示が更新される', async () => {
    // CartProvider内で両方のコンポーネントをレンダリング
    render(
      <CartProvider
        mode="payment"
        cartMode="client-only"
        stripe={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        currency="JPY"
      >
        <Product product={{ id: '1', name: 'テスト商品', emoji: '🍎', price: 1000 }} />
        <ShoppingCart />
      </CartProvider>
    );

    // 「カートに追加」ボタンを見つけてクリック
    const addButton = screen.getByRole('button', { name: /カートに追加/i });
    fireEvent.click(addButton);

    // 商品がカートに表示されることを確認
    expect(screen.getByText('テスト商品')).toBeInTheDocument();
    expect(screen.getByText('￥1000')).toBeInTheDocument();
    expect(screen.getByText('(1)')).toBeInTheDocument();
  });
});
```

### 3. エンドツーエンドテスト
E2Eテストは、アプリケーションを通じた実際のユーザージャーニーをシミュレートします。

**推奨ツール:**
- Cypress: ブラウザベースのエンドツーエンドテスト用
- Playwright: マルチブラウザサポートを持つCypressの代替

**テスト対象ユーザーフロー:**
- 完全なショッピングジャーニー: 商品閲覧 → カートに追加 → チェックアウト
- エラー処理: 空のカートでチェックアウトを試みる
- バリデーション: カート価値の最小/最大制限のテスト

**Cypressテストの例:**
```javascript
describe('Eコマースショッピングフロー', () => {
  it('ユーザーが商品をカートに追加してチェックアウトに進むことができる', () => {
    // ホームページにアクセス
    cy.visit('/');

    // イントロ画面の「進む」ボタンをクリック
    cy.contains('button', '進む').click();

    // 商品をカートに追加
    cy.contains('カートに追加').first().click();

    // カートを開く
    cy.get('[data-testid="cart-icon"]').click();

    // 商品がカートにあることを確認
    cy.contains('テスト商品').should('be.visible');

    // チェックアウトに進む
    cy.contains('button', 'チェックアウトに進む').click();

    // Stripeへのリダイレクトを確認
    cy.url().should('include', 'checkout.stripe.com');
  });
});
```

### 4. 支払い統合テスト
Stripe統合のテストには特別な考慮が必要です。

**アプローチ:**
- Stripeのテストモードとテストカードを使用
- ユニット/統合テスト用にStripeリダイレクトをモック
- シミュレートされた戻りで成功/キャンセルフローをテスト

**Stripeのテストセットアップ例:**
```javascript
// テストセットアップ内
const mockRedirectToCheckout = jest.fn().mockResolvedValue({ error: null });

jest.mock('use-shopping-cart', () => ({
  useShoppingCart: () => ({
    redirectToCheckout: mockRedirectToCheckout,
    cartCount: 5,
    totalPrice: 5000
  }),
}));

// テスト内
test('クリック時にCheckoutButtonがStripeにリダイレクトする', async () => {
  render(<CheckoutButton />);

  const button = screen.getByRole('button', { name: /チェックアウトに進む/i });
  fireEvent.click(button);

  expect(mockRedirectToCheckout).toHaveBeenCalled();
});
```

### 5. ビジュアルリグレッションテスト
UIコンポーネントが異なるデバイスやブラウザで正しくレンダリングされることを確認します。

**推奨ツール:**
- Storybook: コンポーネントドキュメントとビジュアルテスト用
- PercyまたはChromatic: ビジュアルリグレッションテスト用

### 6. パフォーマンステスト
アプリケーションのパフォーマンスを測定し、最適化します。

**推奨ツール:**
- Lighthouse: ウェブページのパフォーマンス、アクセシビリティ、SEOなどを測定
- WebPageTest: 詳細なパフォーマンス分析
- Next.js Analytics: Next.jsアプリケーション専用の分析ツール

**テスト対象領域:**
- ページ読み込み時間
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- 画像最適化
- コード分割の効果

**パフォーマンステストの例:**
```javascript
// Lighthouseを使用したCIテスト例
describe('パフォーマンステスト', () => {
  it('ホームページが性能基準を満たしている', async () => {
    const { lhr } = await lighthouse('https://your-site.com');
    
    expect(lhr.categories.performance.score).toBeGreaterThanOrEqual(0.9); // 90%以上
    expect(lhr.categories.accessibility.score).toBeGreaterThanOrEqual(0.9);
    expect(lhr.audits['first-contentful-paint'].numericValue).toBeLessThan(1000); // 1秒未満
  });
});
```

### 7. アクセシビリティテスト
すべてのユーザーがアプリケーションを使用できることを確認します。

**推奨ツール:**
- axe-core: 自動アクセシビリティテスト
- @testing-library/jest-dom: アクセシビリティ関連のアサーション
- Cypress-axe: Cypressと統合されたアクセシビリティテスト

**テスト対象領域:**
- キーボードナビゲーション
- スクリーンリーダー互換性
- コントラスト比
- フォームラベルとアクセシビリティ
- ARIA属性の正しい使用

**アクセシビリティテストの例:**
```javascript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProductList from '../components/ProductList';

expect.extend(toHaveNoViolations);

describe('ProductList アクセシビリティ', () => {
  it('アクセシビリティ違反がない', async () => {
    const { container } = render(<ProductList products={mockProducts} />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
});
```

### 8. セキュリティテスト
アプリケーションのセキュリティを確保します。

**推奨ツール:**
- OWASP ZAP: 自動セキュリティスキャン
- npm audit: 依存関係の脆弱性チェック
- Snyk: コードとオープンソース依存関係のセキュリティ問題を検出

**テスト対象領域:**
- クロスサイトスクリプティング (XSS) 対策
- クロスサイトリクエストフォージェリ (CSRF) 対策
- 適切なHTTPセキュリティヘッダー
- 支払い情報の安全な処理
- 入力バリデーション

**セキュリティテストの例:**
```bash
# 依存関係の脆弱性をチェック
npm audit

# Snykを使用したセキュリティテスト
snyk test

# CIパイプラインでのOWASP ZAP自動スキャン
zap-cli quick-scan --self-contained --start-options '-config api.disablekey=true' https://your-site.com
```

## テスト環境のセットアップ

### インストール手順
1. JestとReact Testing Libraryをインストール:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

2. E2Eテスト用にCypressをインストール:
```bash
npm install --save-dev cypress
```

3. アクセシビリティテスト用のツールをインストール:
```bash
npm install --save-dev jest-axe axe-core cypress-axe
```

4. package.jsonにテストスクリプトを追加:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "cypress": "cypress open",
    "cypress:headless": "cypress run",
    "test:a11y": "jest -c jest.a11y.config.js",
    "test:security": "npm audit && snyk test"
  }
}
```

5. Jestの設定 (jest.config.js):
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1'
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  }
};
```

6. Jestセットアップファイル (jest.setup.js):
```javascript
import '@testing-library/jest-dom';
```

## 継続的インテグレーション
テストをCI/CDパイプラインに統合します:

1. すべてのプルリクエストでユニットテストと統合テストを実行
2. ステージングデプロイメントでE2Eテストを実行
3. 定期的にセキュリティとアクセシビリティテストを実行
4. GitHub ActionsまたはCircleCIなどのCIサービスを使用

**GitHub Actionsワークフロー例:**
```yaml
name: テスト

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Node.jsのセットアップ
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: 依存関係のインストール
        run: npm ci
      - name: ユニットテストとインテグレーションテストの実行
        run: npm test
      - name: E2Eテストの実行
        run: npm run cypress:headless
      - name: セキュリティテストの実行
        run: npm run test:security
      - name: アクセシビリティテストの実行
        run: npm run test:a11y
```

## テスト戦略の実装ロードマップ

### フェーズ1: 基本テスト
- ユニットテストの実装
- 基本的な統合テストの追加
- テストカバレッジの目標設定 (最低70%)

### フェーズ2: 高度なテスト
- E2Eテストの実装
- 支払いフローのテスト
- ビジュアルリグレッションテストの追加

### フェーズ3: 品質強化
- パフォーマンステストの実装
- アクセシビリティテストの追加
- セキュリティテストの統合

## 結論
この包括的なテスト戦略を実装することで、Eコマースアプリケーションの品質と信頼性を確保できます。これらのテスト手法を導入することで、変更や機能追加を自信を持って行いながら、高品質なユーザーエクスペリエンスを維持することができます。