#!/usr/bin/env bash
# Sample 20 redirects from S0 map: one 301 then follow → 200.
# Usage: BASE_URL=http://127.0.0.1:3000 ./scripts/curl-redirect-sample.sh
set -euo pipefail

BASE="${BASE_URL:-http://127.0.0.1:3000}"
fail=0
ok=0

check() {
  local path="$1"
  local expect="$2"
  local label="$3"

  local headers code loc_path follow
  headers=$(curl -sS -D - -o /dev/null "$BASE$path")
  code=$(printf '%s\n' "$headers" | awk 'BEGIN{c=0} /^HTTP\//{c=$2} END{print c}')
  loc_path=$(printf '%s\n' "$headers" | python3 -c '
import sys
loc=""
for line in sys.stdin:
    if line.lower().startswith("location:"):
        loc=line.split(":",1)[1].strip()
        break
from urllib.parse import urlparse
print(urlparse(loc).path if "://" in loc else loc)
')

  if [[ "$code" != "301" ]]; then
    echo "FAIL $label: expected 301 got $code for $path"
    fail=$((fail + 1))
    return
  fi
  if [[ "$loc_path" != "$expect" ]]; then
    echo "FAIL $label: Location want $expect got $loc_path"
    fail=$((fail + 1))
    return
  fi

  # max-redirs 1: final must be 200 without a second redirect hop
  follow=$(curl -sS -o /dev/null -w "%{http_code}" -L --max-redirs 1 "$BASE$path")
  if [[ "$follow" != "200" ]]; then
    echo "FAIL $label: follow got $follow (want 200)"
    fail=$((fail + 1))
    return
  fi

  echo "OK   $label: 301 → $expect → 200"
  ok=$((ok + 1))
}

# ≥10 a-muru-ru, ≥5 c-cyrillic-staging, all 3 b-orphan-muru-ru
check '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskiy-podsvechnik/' '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskaya-vaza-tikhaya-zemlya/' '1:a-muru-ru'
check '/catalog/vazy-i-aksessuary/podsvechniki/keramicheskiy-podsvechnik-tikhaya-zemlya/' '/catalog/vazy-i-aksessuary/podsvechniki/keramicheskiy-podsvechnik-tikhaya-zemlya-malyy/' '2:a-muru-ru'
check '/catalog/vazy-i-aksessuary/podsvechniki/micheskiy-podsvechnik-tikhaya-zemlya/' '/catalog/vazy-i-aksessuary/podsvechniki/kemicheskiy-podsvechnik-tikhaya-zemlya-bolshoy/' '3:a-muru-ru'
check '/catalog/vazy-i-aksessuary/podsvechniki/micheskiy-podsvechnik-tikhaya-zemlya-1540368624/' '/catalog/vazy-i-aksessuary/podsvechniki/kemicheskiy-podsvechnik-tikhaya-zemlya-bolshoy-2/' '4:a-muru-ru'
check '/catalog/vazy-i-aksessuary/podsvechniki/micheskiy-podsvechnik-tikhaya-zemlya-1872192570/' '/catalog/vazy-i-aksessuary/podsvechniki/keramicheskiy-podsvechnik-tikhaya-zemlya-malyy-2/' '5:a-muru-ru'
check '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskiy-podsvechnik-1839148241/' '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskaya-vaza-tikhaya-zemlya-2/' '6:a-muru-ru'
check '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskiy-podsvechnik-1929190593/' '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskaya-vaza-tikhaya-zemlya-3/' '7:a-muru-ru'
check '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskiy-podsvechnik-792922840/' '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskaya-vaza-tikhaya-zemlya-4/' '8:a-muru-ru'
check '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskiy-podsvechnik-1317933197/' '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskaya-vaza-forma-sveta/' '9:a-muru-ru'
check '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskiy-podsvechnik-2134917596/' '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskaya-vaza-forma-sveta-2/' '10:a-muru-ru'

check '/catalog/вазы-и-аксессуары/' '/catalog/vazy-i-aksessuary/' '11:c-cyrillic-staging'
check '/catalog/вазы-и-аксессуары/вазы-и-кувшины/MU0005/' '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskaya-vaza-tikhaya-zemlya/' '12:c-cyrillic-staging'
check '/catalog/флористика/горшки-и-кашпо/' '/catalog/floristika-dlya-doma/gorshki-i-kashpo/' '13:c-cyrillic-staging'
check '/catalog/флористика/флористический-инструмент/' '/catalog/floristika-dlya-doma/floristicheskiy-instrument/' '14:c-cyrillic-staging'
check '/catalog/натуральный-декор/корзины-и-плетеные-изделия/' '/catalog/naturalnyy-dekor/korziny-i-pletenye-izdeliya/' '15:c-cyrillic-staging'

check '/catalog/interer/predmety-dekora/' '/catalog/interer/' '16:b-orphan-muru-ru'
check '/catalog/kukhnya-i-stolovaya/khranenie-i-poryadok/' '/catalog/kukhnya-i-stolovaya/' '17:b-orphan-muru-ru'
check '/catalog/kukhnya-i-stolovaya/podsvechniki1/' '/catalog/kukhnya-i-stolovaya/' '18:b-orphan-muru-ru'

check '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskiy-podsvechnik-1985720063/' '/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/keramicheskaya-vaza-forma-sveta-3/' '19:a-muru-ru'
check '/catalog/vazy-i-aksessuary/podsvechniki/micheskiy-podsvechnik-tikhaya-zemlya-1540368624/' '/catalog/vazy-i-aksessuary/podsvechniki/kemicheskiy-podsvechnik-tikhaya-zemlya-bolshoy-2/' '20:a-muru-ru'

echo "---"
echo "ok=$ok fail=$fail"
[[ "$fail" -eq 0 ]]
