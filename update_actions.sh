#!/bin/bash
# Script to update Github actions cache
sed -i 's/actions\/cache@0c45773b623bea8c8e75f6c82b208c3cf94ea4f9 # v4.0.2/actions\/cache@27d5ce7f107fe9357f9df03efb73ab90386fccae # v5.0.5/g' .github/workflows/*.yml
