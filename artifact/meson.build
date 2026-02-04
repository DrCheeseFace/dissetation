project('chombo', ['c'],
  default_options: [
    'c_std=c99',
    'warning_level=2',
    'werror=false',
  ]
)

host_system = host_machine.system()
cc = meson.get_compiler('c')
fs = import('fs')

strict_c_flags = [
  '-Werror',
  '-Wpointer-arith',
  '-Wcast-align',
  '-Wstrict-prototypes',
  '-Wwrite-strings',
  '-Waggregate-return',
  '-Wswitch-default',
  '-Wswitch-enum',
  '-Wunreachable-code',
  '-Winit-self',
  '-Wbad-function-cast',
  '-Wformat=2',
  '-Wlogical-op',
  '-Wshadow',
  '-Wundef',
  # '-Wfloat-equal'
]

if cc.get_id() == 'gcc' or cc.get_id() == 'clang'
  add_project_arguments(strict_c_flags, language: 'c')
endif

is_release = get_option('buildtype') == 'release'
cargo_release_flag = is_release ? ['--release'] : []
rust_mode = is_release ? 'release' : 'debug'

#deps
sdl3_dep = dependency('sdl3', fallback: ['sdl3', 'sdl3_dep'])
deps = [sdl3_dep]

# mrutils :)
inc = include_directories(['src/mr_utils/include','include'])

source_files = files(
  'src/g_gamestate.c',
  'src/w_window.c',
  'src/main.c',
  'src/mr_utils/src/mrd_debug.c',
  'src/mr_utils/src/mrl_logger.c',
  'src/mr_utils/src/mrs_strings.c',
  'src/mr_utils/src/mrt_test.c',
  'src/mr_utils/src/mrv_vectors.c'
)

chombo_executable = executable('visu',
  source_files,
  dependencies: deps,
  include_directories: inc,
  link_language: 'c',
  install: true,
  install_rpath: '$ORIGIN/../' + get_option('libdir')
)

desktop_conf = configuration_data()
desktop_conf.set('EXEC', 'chombo')
desktop_conf.set('VERSION', meson.project_version())

install_symlink('libSDL3.so.0',
  pointing_to: 'libSDL3.so',
  install_dir: get_option('libdir')
)
