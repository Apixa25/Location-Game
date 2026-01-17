if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/gradle-home/caches/8.13/transforms/ff5750d0d549eadfeda27c0c110150dc/transformed/jetified-hermes-android-0.81.4-debug/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/gradle-home/caches/8.13/transforms/ff5750d0d549eadfeda27c0c110150dc/transformed/jetified-hermes-android-0.81.4-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

