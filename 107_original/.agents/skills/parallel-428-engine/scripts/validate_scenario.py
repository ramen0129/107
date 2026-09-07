#!/usr/bin/env python3
"""
Scenario & TIPS Static Integrity Validator for Parallel Japania (428-Engine)
"""

import os
import re
import sys

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../"))
    scenario_files = [
        "scenario_ren.html",
        "scenario_elena.html",
        "scenario_daniel.html",
        "scenario_climax_ren.html",
        "scenario_climax_elena.html",
        "scenario_climax_daniel.html",
        "scenario_climax.html"
    ]
    tips_file = "js_tips.html"

    print("==================================================")
    print("🔍 428-Engine Scenario & TIPS Integrity Validator")
    print(f"Base Directory: {base_dir}")
    print("==================================================")

    # 1. Parse TIPS
    tips_path = os.path.join(base_dir, tips_file)
    defined_tips = set()
    if os.path.exists(tips_path):
        with open(tips_path, "r", encoding="utf-8") as f:
            content = f.read()
            # Match top-level keys in TIPS_MASTER: "キー名": { ... }
            matches = re.findall(r'["\']([^"\']+)["\']\s*:\s*\{', content)
            defined_tips = set(matches)
        print(f"✓ Loaded {len(defined_tips)} TIPS from {tips_file}")
    else:
        print(f"⚠️ Warning: {tips_file} not found.")

    # 2. Parse Scenario Nodes
    defined_nodes = set()
    referenced_nodes = set()
    used_tips = set()
    bad_ends = set()
    keep_outs = set()
    clear_ends = set()

    node_definitions = {}

    node_pattern = re.compile(r'["\']([A-Z0-9_]+)["\']\s*:\s*\{', re.MULTILINE)
    tip_pattern = re.compile(r"data-tip=['\"]([^'\"]+)['\"]")
    next_pattern = re.compile(r"next\s*:\s*['\"]([A-Z0-9_]+)['\"]")
    jump_pattern = re.compile(r"jumpTarget\s*:\s*['\"]([A-Z0-9_]+)['\"]")
    default_next_pattern = re.compile(r"defaultNext\s*:\s*['\"]([A-Z0-9_]+)['\"]")
    on_pass_pattern = re.compile(r"onPass\s*:\s*['\"]([A-Z0-9_]+)['\"]")
    on_block_pattern = re.compile(r"onBlock\s*:\s*['\"]([A-Z0-9_]+)['\"]")

    for s_file in scenario_files:
        path = os.path.join(base_dir, s_file)
        if not os.path.exists(path):
            print(f"⚠️ File missing: {s_file}")
            continue

        with open(path, "r", encoding="utf-8") as f:
            text = f.read()

        # Find defined node IDs
        for match in node_pattern.finditer(text):
            node_id = match.group(1)
            # Filter out non-node keys
            if node_id not in ("MASTER_DB", "SCENARIO_REN", "SCENARIO_ELENA", "SCENARIO_DANIEL", "SCENARIO_CLIMAX_REN", "SCENARIO_CLIMAX_ELENA", "SCENARIO_CLIMAX_DANIEL", "SCENARIO_CLIMAX"):
                defined_nodes.add(node_id)
                node_definitions[node_id] = s_file

        # Find node attributes
        if "isBadEnd: true" in text or "isBadEnd:true" in text:
            for m in re.finditer(r'["\']([A-Z0-9_]+)["\']\s*:\s*\{[^}]*?isBadEnd\s*:\s*true', text):
                bad_ends.add(m.group(1))

        if "isKeepOut: true" in text or "isKeepOut:true" in text:
            for m in re.finditer(r'["\']([A-Z0-9_]+)["\']\s*:\s*\{[^}]*?isKeepOut\s*:\s*true', text):
                keep_outs.add(m.group(1))

        if "isClearEnd: true" in text or "isTrueEnd: true" in text:
            for m in re.finditer(r'["\']([A-Z0-9_]+)["\']\s*:\s*\{[^}]*?(?:isClearEnd|isTrueEnd)\s*:\s*true', text):
                clear_ends.add(m.group(1))

        # Find referenced targets
        for m in next_pattern.finditer(text):
            referenced_nodes.add((m.group(1), s_file, "next"))
        for m in jump_pattern.finditer(text):
            referenced_nodes.add((m.group(1), s_file, "jumpTarget"))
        for m in default_next_pattern.finditer(text):
            referenced_nodes.add((m.group(1), s_file, "defaultNext"))
        for m in on_pass_pattern.finditer(text):
            referenced_nodes.add((m.group(1), s_file, "onPass"))
        for m in on_block_pattern.finditer(text):
            referenced_nodes.add((m.group(1), s_file, "onBlock"))

        # Find TIPS used
        for m in tip_pattern.finditer(text):
            used_tips.add((m.group(1), s_file))

    print(f"✓ Found {len(defined_nodes)} scenario nodes defined across 4 scenario files.")
    print(f"  - Bad Ends detected: {len(bad_ends)}")
    print(f"  - Keep Outs detected: {len(keep_outs)}")
    print(f"  - Clear/True Ends: {len(clear_ends)}")

    # 3. Check for broken transitions
    broken_nodes = []
    for ref_id, src_file, ref_type in referenced_nodes:
        if ref_id not in defined_nodes:
            broken_nodes.append((ref_id, src_file, ref_type))

    # 4. Check for broken TIPS
    broken_tips = []
    for tip_key, src_file in used_tips:
        if tip_key not in defined_tips:
            broken_tips.append((tip_key, src_file))

    # Print Results
    print("\n------------------ INTEGRITY REPORT ------------------")
    errors_found = False

    if broken_nodes:
        errors_found = True
        print(f"❌ [BROKEN TRANSITION TARGETS] ({len(broken_nodes)} issues):")
        for ref_id, src_file, ref_type in sorted(broken_nodes):
            print(f"   • Target '{ref_id}' ({ref_type}) not found! Referenced in: {src_file}")
    else:
        print("✅ All node transition targets exist.")

    if broken_tips:
        errors_found = True
        print(f"\n❌ [UNREGISTERED TIPS] ({len(broken_tips)} issues):")
        for tip_key, src_file in sorted(broken_tips):
            print(f"   • TIP '{tip_key}' not defined in {tips_file}! Used in: {src_file}")
    else:
        print("✅ All embedded TIPS links match TIPS_MASTER entries.")

    print("------------------------------------------------------")
    if errors_found:
        print("⚠️ Validation completed with issues.")
        sys.exit(1)
    else:
        print("🎉 Scenario database is 100% consistent and healthy!")
        sys.exit(0)

if __name__ == "__main__":
    main()
