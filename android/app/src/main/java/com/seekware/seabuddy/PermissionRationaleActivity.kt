package com.healthconnectexample

import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class PermissionsRationaleActivity: AppCompatActivity() {
  override fun onCreate(androidsavedInstanceState: Bundle?) {
   // if (savedInstanceState != null) {
    //    finish() // Close the activity if restoring from a saved state
    //    return
   // }
    super.onCreate(null)

    val webView = WebView(this)
    webView.webViewClient = object : WebViewClient() {
      override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        return false
      }
    }

    webView.loadUrl("https://developer.android.com/health-and-fitness/guides/health-connect/develop/get-started")

    setContentView(webView)
  }
}