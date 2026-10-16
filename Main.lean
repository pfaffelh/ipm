import VersoManual
import Ipm

open Verso.Genre Manual

def config : RenderConfig where
  emitTeX := false
  emitHtmlSingle := .no
  emitHtmlMulti := .immediately
  -- One page per session.
  htmlDepth := 1

def main := manualMain (%doc Ipm) (config := config)
