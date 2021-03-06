package com.mdra_app;

import android.app.Application;

import com.RNFetchBlob.RNFetchBlobPackage;
import com.beefe.picker.PickerViewPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.reactnativenavigation.NavigationApplication;

import com.oblador.vectoricons.VectorIconsPackage;

import com.horcrux.svg.SvgPackage;

import fr.greweb.reactnativeviewshot.RNViewShotPackage;

import com.christopherdro.htmltopdf.RNHTMLtoPDFPackage;

import br.com.classapp.RNSensitiveInfo.RNSensitiveInfoPackage;

import java.util.Arrays;
import java.util.List;


public class MainApplication extends NavigationApplication  {
  @Override
    public boolean isDebug() {
       // Make sure you are using BuildConfig from your own application
       return BuildConfig.DEBUG;
    }

    protected List<ReactPackage> getPackages() {
       // Add additional packages you require here
       // No need to add RnnPackage and MainReactPackage
       return Arrays.<ReactPackage>asList(
           new VectorIconsPackage(),
           new SvgPackage(),
           new PickerViewPackage(),
           new RNViewShotPackage(),
           new RNHTMLtoPDFPackage(),
           new RNSensitiveInfoPackage(),
           new RNFetchBlobPackage()
       );
    }

    @Override
    public List<ReactPackage> createAdditionalReactPackages() {
       return getPackages();
    }

    @Override
    public String getJSMainModuleName() {
        return "index";
    }
}
