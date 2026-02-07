#!/bin/bash

# Script helper pour lancer les tests E2E
# Usage: ./e2e/run-tests.sh [options]

set -e

# Couleurs pour output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 MuchLove E2E Tests${NC}"
echo ""

# Parse arguments
MODE="default"
FILE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --ui)
      MODE="ui"
      shift
      ;;
    --debug)
      MODE="debug"
      shift
      ;;
    --headed)
      MODE="headed"
      shift
      ;;
    --file=*)
      FILE="${1#*=}"
      shift
      ;;
    *)
      echo -e "${RED}Option inconnue: $1${NC}"
      exit 1
      ;;
  esac
done

# Exécuter selon le mode
case $MODE in
  ui)
    echo -e "${YELLOW}Lancement en mode UI...${NC}"
    npx playwright test --ui
    ;;
  debug)
    echo -e "${YELLOW}Lancement en mode debug...${NC}"
    if [ -n "$FILE" ]; then
      npx playwright test --debug "$FILE"
    else
      npx playwright test --debug
    fi
    ;;
  headed)
    echo -e "${YELLOW}Lancement avec navigateur visible...${NC}"
    if [ -n "$FILE" ]; then
      npx playwright test --headed "$FILE"
    else
      npx playwright test --headed
    fi
    ;;
  *)
    echo -e "${YELLOW}Lancement des tests...${NC}"
    if [ -n "$FILE" ]; then
      npx playwright test "$FILE"
    else
      npx playwright test
    fi
    ;;
esac

# Afficher le rapport si disponible
if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Tests terminés avec succès${NC}"
  echo -e "Voir le rapport: ${YELLOW}npx playwright show-report${NC}"
else
  echo ""
  echo -e "${RED}❌ Certains tests ont échoué${NC}"
  exit 1
fi
