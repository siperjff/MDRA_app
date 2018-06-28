//system imports
import React, {PureComponent} from 'react';
import {StyleSheet, View, Alert, Dimensions, ScrollView} from 'react-native';
import { Button } from 'react-native-elements';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {connect}  from "react-redux";

//component imports
import Input from "../../components/Input/Input";
import DropDownList from "../../components/dropDownList/DropDownList";
import {addData} from "../../store/actions/addData";

class FormScreenInitial extends PureComponent{
    state = {
        ViewMode: Dimensions.get('window').height > 500 ? "portrait" : "landscape",
        formData: null,
        currentPosition: 0,
    };

    _handleSubmit =(async (values, bag) => {
        try {
            this.props.onAddData(values,this.state.currentPosition);
            Alert.alert("Welcome!\n"+ values.email);
            bag.setSubmitting(false);
        }catch (e) {
            bag.setSubmitting(false);
            bag.setErrors(e);
        }
    });

    render() {
        return(
            <View style={styles.container}>
                <ScrollView>
                    <Formik
                        initialValues={{ email:'', password: '', confirmPassword:'', gender:'male', animal:'Cat'}}
                        onSubmit={this._handleSubmit}
                        validationSchema={Yup.object().shape({
                            email: Yup.string().email().required(),
                            password: Yup.string().min(6).required(),
                            confirmPassword: Yup.string().oneOf([Yup.ref('password', null)], 'Doesn\'t match Password')
                        })}
                        render={({
                                     values,
                                     handleSubmit,
                                     setFieldValue,
                                     errors,
                                     touched,
                                     setFieldTouched,
                                     isValid,
                                     isSubmitting
                                 }) => (
                            <View>
                                <Input
                                    label="Email"
                                    autoCapitalize="none"
                                    value={values.email}
                                    onChange={setFieldValue}
                                    onTouch={setFieldTouched}
                                    name="email"
                                    error={touched.email && errors.email}
                                />
                                <View style={styles.twoPerRowContainer}>
                                    <View style={styles.inputContainer}>
                                        <Input
                                            label="Password"
                                            secureTextEntry
                                            value={values.password}
                                            onChange={setFieldValue}
                                            onTouch={setFieldTouched}
                                            name="password"
                                            error={touched.password && errors.password}
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <Input
                                            label="Confirm Password"
                                            secureTextEntry
                                            value={values.confirmPassword}
                                            onChange={setFieldValue}
                                            onTouch={setFieldTouched}
                                            name="confirmPassword"
                                            error={touched.confirmPassword && errors.confirmPassword}
                                        />
                                    </View>
                                </View>
                                <View style={styles.twoPerRowContainer}>
                                    <DropDownList style={styles.inputContainer} value={values.gender} name="gender" onChange={setFieldValue} itemList={["Male","Female"]}/>
                                    <DropDownList style={styles.inputContainer} value={values.animal} name="animal" onChange={setFieldValue} itemList={["Cat","Dog"]}/>
                                </View>
                                <Button
                                    buttonStyle={styles.button}
                                    title="Go to next step"
                                    onPress={handleSubmit}
                                    disabled={(!isValid || isSubmitting)}
                                    loading={isSubmitting}
                                />
                            </View>
                        )}
                    />
                </ScrollView>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    button: {
        marginTop: 20,
        width: '100%',
        justifyContent: "center",
        alignItems: "center"
    },
    twoPerRowContainer: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    inputContainer:{
        width: '50%',
    },
    indicatorContainer:{
        flex:1,flexDirection: "row",
        justifyContent:"space-between",
        position: "absolute",
        bottom: 0,
        left: 0,
    }

});

const mapDispatchToProps = dispatch => {
    return {
        onAddData: (data,position) => dispatch(addData(data,position))
    };
};

export default connect(null,mapDispatchToProps)(FormScreenInitial);