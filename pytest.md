---
marp: false
---

# Pytest 測試框架教學簡報

## 為何選擇 Pytest？

- Python 最受歡迎的測試框架之一
- 直覺的 `assert` 語法，無需學習新 API
- 廣大的外掛生態系，輕鬆擴充
- 與 CI/CD 平台高度整合

---

## 安裝與快速開始

```bash
pip install pytest
```

執行全部測試：

```bash
pytest
```

指定資料夾或檔案：

```bash
pytest tests/ test_math.py
```

---

## 測試檔與函式命名規則

- 檔名：`test_*.py` 或 `*_test.py`
- 函式：`def test_*(self):`
- 類別：以 `Test` 開頭且不含 `__init__`

Pytest 會依照這些規則自動 discovery 測試案例。

---

## 基本斷言示範

```python
def add(a, b):
    return a + b

def test_add():
    assert add(1, 2) == 3
```

- 直接使用內建 `assert`，失敗時顯示詳盡差異

---

## Fixture 基礎

- 共用前置／後置動作，避免重複程式碼
- 以函式為單位注入

```python
import pytest

@pytest.fixture
def sample_list():
    return [1, 2, 3]
```

---

## 使用 Fixture

```python
def test_len(sample_list):
    assert len(sample_list) == 3
```

- 測試函式只需宣告參數，Pytest 自動注入對應 fixture

---

## 參數化測試 (parametrize)

```python
import pytest

@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_add(a, b, expected):
    assert add(a, b) == expected
```

- 以表格方式一次覆蓋多組資料

---

## 標記 (markers) 與測試選取

- 自訂：`@pytest.mark.slow`
- 執行特定標記：`pytest -m slow`
- 跳過：`pytest.skip("原因")`
- 預期失敗：`pytest.xfail("尚未實作")`

---

## 失敗重跑與報告

- 安裝 `pytest-rerunfailures` 重跑 flaky 測試
- HTML/JUnit 報告：`pytest --html=report.html --self-contained-html`

---

## 設定檔 pytest.ini

```ini
[pytest]
addopts = -q -ra
log_cli = true
testpaths = tests
markers =
    slow: 長時間執行的測試
```

- 集中管理共用選項與標記說明

---

## 在 CI/CD 執行 Pytest

GitHub Actions 範例：

```yaml
name: test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r requirements.txt
      - run: pytest
```

- 任何 PR 皆自動跑測試，確保品質

---

## 最佳實踐

- 單一斷言表達單一概念
- 測試獨立，避免彼此依賴
- 合理分層：unit、integration、e2e
- 保持測試執行速度，提升開發迭代效率

---

## 常見錯誤排除

| 情境         | 原因              | 解法                                 |
| ------------ | ----------------- | ------------------------------------ |
| 測試未被發現 | 檔名/函式命名不符 | 重新命名為 `test_*`                  |
| ImportError  | 模組路徑錯誤      | 加入 `__init__.py` 或設定 PYTHONPATH |
| 環境依賴     | 系統差異          | 使用 fixture 模擬 / dockerize        |

---

## 進階主題

- Plug‑in 開發
- 非同步測試 (pytest‑asyncio)
- Property‑based testing (hypothesis)
- 測試分片 (pytest‑xdist)

---

## 參考資源

- 官方文件 [https://docs.pytest.org/](https://docs.pytest.org/)
- pytest plugins 列表 [https://docs.pytest.org/en/stable/reference/plugindex.html](https://docs.pytest.org/en/stable/reference/plugindex.html)
- 書籍《pytest Quick Start Guide》

---

# Q & A

感謝聆聽！歡迎提問。
