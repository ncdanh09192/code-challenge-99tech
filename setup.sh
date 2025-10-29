#!/bin/bash

# 99Tech Code Challenge - Interactive Setup Script
# Allows user to select and run any problem easily

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Header
clear
echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     99Tech Code Challenge - Setup & Run              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if required tools are available
check_requirements() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed${NC}"
        echo "Please install Node.js from https://nodejs.org/"
        exit 1
    fi

    if ! command -v docker &> /dev/null && [ "$1" == "6" ]; then
        echo -e "${RED}Error: Docker is not installed (required for Problem 6)${NC}"
        echo "Please install Docker from https://docker.com/"
        exit 1
    fi
}

# Show menu
show_menu() {
    echo -e "${YELLOW}Select a problem to run:${NC}"
    echo ""
    echo -e "  ${BLUE}4${NC}) Palindrome Checking (TypeScript)"
    echo -e "  ${BLUE}5${NC}) CRUD API Server (Node.js + Express)"
    echo -e "  ${BLUE}6${NC}) Real-time Leaderboard (Docker + Redis)"
    echo -e "  ${BLUE}0${NC}) Exit"
    echo ""
    echo -n "Enter choice [0-6]: "
    read choice
}

# Problem 4: Palindrome Checking
run_problem4() {
    echo -e "\n${GREEN}▶ Setting up Problem 4 - Palindrome Checking${NC}\n"

    cd "src/problem4"

    echo -e "${BLUE}Running palindrome checker...${NC}\n"
    npx ts-node index.ts

    echo -e "\n${GREEN}✓ Problem 4 completed${NC}"
}

# Problem 5: CRUD API
run_problem5() {
    echo -e "\n${GREEN}▶ Setting up Problem 5 - CRUD API Server${NC}\n"

    cd "src/problem5"

    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install > /dev/null 2>&1

    echo -e "${BLUE}Starting server...${NC}\n"
    make start

    echo -e "\n${GREEN}✓ Server running at: http://localhost:5000${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
}

# Problem 6: Real-time Leaderboard
run_problem6() {
    echo -e "\n${GREEN}▶ Setting up Problem 6 - Real-time Leaderboard${NC}\n"

    cd "src/problem6"

    echo -e "${BLUE}Starting Docker containers...${NC}\n"
    make start

    echo -e "\n${GREEN}✓ Services running at: http://localhost:8000${NC}"
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  make test       - Run tests"
    echo -e "  make logs       - View logs"
    echo -e "  make stop       - Stop services"
    echo -e "  make help       - View all commands"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
}

# Main execution
main() {
    show_menu

    case $choice in
        4)
            check_requirements "4"
            run_problem4
            ;;
        5)
            check_requirements "5"
            run_problem5
            ;;
        6)
            check_requirements "6"
            run_problem6
            ;;
        0)
            echo -e "\n${BLUE}Goodbye!${NC}\n"
            exit 0
            ;;
        *)
            echo -e "\n${RED}Invalid choice. Please try again.${NC}\n"
            main
            ;;
    esac
}

# Run main function
main
