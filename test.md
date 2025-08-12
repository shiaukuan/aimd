---
style: |
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
---
# PyTest 教學簡報

---  

## 目錄  
1️⃣ 為什麼選擇 **pytest**  
2️⃣ 安裝與環境設定  
3️⃣ 基本測試寫法  
4️⃣ 斷言 (Assertions)  
5️⃣ Fixture 基礎  
6️⃣ 參數化測試 (`@pytest.mark.parametrize`)  
7️⃣ 內建標記與自訂標記  
8️⃣ Mock 與 Patch  
9️⃣ 測試覆蓋率 (`pytest-cov`)  
🔟 最佳實踐 & CI 整合  

---  

## 1️⃣ 為什麼選擇 **pytest**？  
- **簡潔**：只要寫普通的 Python 函式，即可當作測試。  
- **強大的功能**：fixture、參數化、插件生態系。  
- **易讀**：斷言失敗時，報告自動顯示詳細的表達式值。  
- **廣泛支援**：支援 unittest、nose、doctest 等遺留測試。  

---  

## 2️⃣ 安裝與環境設定  

```bash
# 建議使用 virtualenv / poetry / conda
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 安裝 pytest（與常用插件）
pip install pytest pytest-cov pytest-mock
```

> **小技巧**：在 `pyproject.toml` 或 `setup.cfg` 中加入設定，讓 `pytest` 行為更一致。

```toml
# pyproject.toml 範例
[tool.pytest.ini_options]
minversion = "6.0"
addopts = "-ra -q"
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
```

---  
<!-- _class: compact -->
## 3️⃣ 基本測試寫法  

```text
project/
│
├─ src/
│   └─ calculator.py
└─ tests/
    └─ test_calculator.py
```

`src/calculator.py`

```python
def add(a: int, b: int) -> int:
    return a + b
```

`tests/test_calculator.py`

```python
def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
```

執行測試：

```bash
pytest          # 會自動搜尋 `tests/` 目錄
```

---  

## 4️⃣ 斷言 (Assertions)  

- **普通斷言**：`assert expr`  
- **自訂訊息**：`assert expr, "說明文字"`  
- **複雜結構**：`assert dict1 == dict2`，pytest 會顯示差異。  

```python
def test_complex():
    result = {"a": 1, "b": [2, 3]}
    expected = {"a": 1, "b": [2, 4]}
    assert result == expected, "結果與預期不符"
```

---  

## 5️⃣ Fixture 基礎  

### 為什麼需要 Fixture？
- 重複使用的測試前置/後置資源（資料庫連線、測試資料、臨時檔案等）。  

### 定義 Fixture  

```python
# conftest.py
import pytest

@pytest.fixture
def sample_data():
    return {"x": 10, "y": 20}
```

### 使用 Fixture  

```python
def test_using_fixture(sample_data):
    assert sample_data["x"] + sample_data["y"] == 30
```

### Scope（範圍）  

| scope   | 說明                         |
|--------|------------------------------|
| `function` | 每個測試函式呼叫一次（預設） |
| `class`    | 每個測試類別一次               |
| `module`   | 每個模組一次                   |
| `session`  | 整個測試執行期間一次           |

```python
@pytest.fixture(scope="module")
def db_connection():
    conn = create_connection()
    yield conn
    conn.close()
```

---  

## 6️⃣ 參數化測試 (`@pytest.mark.parametrize`)  

```python
import pytest

@pytest.mark.parametrize(
    "a,b,expected",
    [
        (1, 2, 3),
        (0, 0, 0),
        (-1, 1, 0),
    ],
)
def test_add_param(a, b, expected):
    assert add(a, b) == expected
```

- **好處**：一次寫多組測試資料，報告會顯示每組參數的結果。  
- **結合 Fixture**：可以同時使用 fixture 與參數化。

```python
@pytest.mark.parametrize("multiplier", [1, 2, 5])
def test_mul_with_fixture(sample_data, multiplier):
    assert sample_data["x"] * multiplier == 10 * multiplier
```

---  

## 7️⃣ 內建標記與自訂標記  

### 常用內建標記  

| 標記 | 功能 |
|------|------|
| `@pytest.mark.skip` | 永遠跳過此測試 |
| `@pytest.mark.xfail` | 期待失敗（如已知 bug） |
| `@pytest.mark.slow` | 標記為慢測試，可在執行時過濾 |

```python
@pytest.mark.skip(reason="尚未實作")
def test_future():
    ...

@pytest.mark.xfail(reason="Bug #123")
def test_known_issue():
    assert 1 == 2
```

### 自訂標記  

在 `pyproject.toml` 或 `pytest.ini` 中註冊，以避免警告：

```toml
[tool.pytest.ini_options]
markers = [
    "integration: marks integration tests",
    "slow: marks tests as slow",
]
```

使用方式：

```python
@pytest.mark.integration
def test_api_call():
    ...
```

---  

## 8️⃣ Mock 與 Patch  

使用 `pytest-mock`（封裝 `unittest.mock`）：

```python
def test_external_api(mocker):
    # 假設有一個函式會呼叫 requests.get
    fake_response = mocker.Mock()
    fake_response.json.return_value = {"status": "ok"}
    mocker.patch("requests.get", return_value=fake_response)

    result = call_external_api()
    assert result["status"] == "ok"
```

*不想安裝插件*，直接使用標準庫：

```python
from unittest.mock import patch

@patch("module.requests.get")
def test_external_api(mock_get):
    mock_get.return_value.json.return_value = {"status": "ok"}
    assert call_external_api()["status"] == "ok"
```

---  

## 9️⃣ 測試覆蓋率 (`pytest-cov`)  

```bash
pip install pytest-cov
pytest --cov=src --cov-report=term-missing
```

- `--cov=src`：指定要測量的套件或目錄。  
- `--cov-report=html`：產生 `htmlcov/` 資料夾，可在瀏覽器開啟。  

### 常見報告選項  

| 選項 | 說明 |
|------|------|
| `term` | 文字報表 |
| `term-missing` | 顯示未覆蓋的行 |
| `html` | 產生互動式 HTML |
| `xml` | 產生 Cobertura XML（CI 用） |

---  
<!-- _class: compact -->

## 🔟 最佳實踐 & CI 整合  

### 最佳實踐  

1. **測試資料**：使用 fixture 或 factory（如 `factory-boy`）產生。  
2. **保持測試獨立**：避免測試相互依賴。  
3. **命名規則**：`test_*.py` 或 `*_test.py`，函式以 `test_` 開頭。  
4. **快速失敗**：先寫失敗的測試，再實作功能（TDD）。  
5. **使用 `--quiet` 或 `-q`**：在 CI 中只顯示失敗訊息。  

### CI（GitHub Actions）範例  

`.github/workflows/ci.yml`

```yaml
name: Python CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.9", "3.10", "3.11"]
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -e .[test]   # 假設在 pyproject 中定義了 test 依賴
      - name: Run tests with coverage
        run: |
          pytest --cov=src --cov-report=xml
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: coverage.xml
```

---  

## 🎉 小結  

- **pytest** 讓測試寫起來更簡潔、功能更強大。  
- 透過 **fixture**、**parametrize**、**markers** 與 **mock**，可以輕鬆構建完整測試套件。  
- 結合 **pytest-cov** 與 **CI**，確保程式碼品質在每一次提交都受到保障。  

*祝開發順利，測試無痛！*  