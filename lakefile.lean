import Lake
open Lake DSL

require verso from git "https://github.com/leanprover/verso.git" @ "v4.34.0"

package ipm where

-- The proof graph editor, embedded with `include_str`; listed so that changes trigger a rebuild.
input_file ipmJs where
  path := "Ipm/ipm.js"

input_file ipmCss where
  path := "Ipm/ipm.css"

lean_lib Ipm where
  needs := #[ipmJs, ipmCss]

@[default_target]
lean_exe ipm where
  root := `Main
