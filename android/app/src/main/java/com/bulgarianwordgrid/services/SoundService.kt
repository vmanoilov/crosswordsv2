package com.bulgarianwordgrid.services

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

object SoundService {
    private var vibrator: Vibrator? = null

    fun initialize(context: Context) {
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            manager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }

    fun playHaptic(type: HapticType) {
        val v = vibrator ?: return
        if (!v.hasVibrator()) return

        val effect = when (type) {
            HapticType.LIGHT -> VibrationEffect.createOneShot(20, VibrationEffect.DEFAULT_AMPLITUDE)
            HapticType.MEDIUM -> VibrationEffect.createOneShot(40, 180)
            HapticType.HEAVY -> VibrationEffect.createOneShot(80, 255)
            HapticType.SUCCESS -> VibrationEffect.createWaveform(longArrayOf(0, 30, 50, 30), -1)
            HapticType.ERROR -> VibrationEffect.createWaveform(longArrayOf(0, 100, 50, 100), -1)
            HapticType.SELECT -> VibrationEffect.createOneShot(15, 100)
        }
        v.vibrate(effect)
    }
}

enum class HapticType {
    LIGHT, MEDIUM, HEAVY, SUCCESS, ERROR, SELECT
}
