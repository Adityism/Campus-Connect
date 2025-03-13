#!/bin/bash

echo "Stopping MySQL service..."
brew services stop mysql

echo "Killing any remaining MySQL processes..."
pkill -9 mysql
pkill -9 mysqld
pkill -9 mysqld_safe

echo "Cleaning up MySQL files..."
rm -f /tmp/mysql.sock
rm -f /tmp/mysql.sock.lock

echo "Starting MySQL service..."
brew services start mysql

echo "Waiting for MySQL to start..."
sleep 5

echo "Checking MySQL status..."
brew services list | grep mysql
