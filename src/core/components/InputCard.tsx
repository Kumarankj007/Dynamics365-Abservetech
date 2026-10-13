/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ErrorIcon from "@mui/icons-material/Error";
import { Checkbox } from "@mui/material";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import Icon from "../utils/Icons";
import PhoneLengthByCountry from "../lib/PhoneLengthByCountry";
import CountryCode from "../lib/CountryCode";
import { useWatch } from "react-hook-form";

const InputCard = ({
  name,
  phName = "",
  label = "",
  placeholder = "",
  pattern,
  required = false,
  requiredMsg = "",
  textarea = false,
  checkBox = false,
  type = "text",
  inputProps,
  textareaProps,
  control,
  errors,
  register,
  getValues,
  iconName = "",
  iconLib = "",
  iconSize = 20,
  dark = false,
}: {
  name: string;
  phName?: string;
  label?: string;
  placeholder?: string;
  pattern?: any;
  required?: boolean;
  requiredMsg?: string;
  textarea?: boolean;
  checkBox?: boolean;
  type?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  control: any;
  errors: any;
  getValues?: any;
  register?: any;
  iconName?: string;
  iconLib?: string;
  iconSize?: number;
  dark?: boolean;
}) => {
  const checkLabel = { inputProps: { "aria-label": "Checkbox terms" } };
  const [show, setShow] = useState<boolean>(false);

  const filteredCountries = CountryCode.filter((c) =>
    c.label.toLowerCase().includes("")
  );

  const selectedCountry: string = useWatch({
    control,
    name: phName,
    defaultValue: "🇮🇳 +91",
  });

  const phLength = () => {
    const selected = CountryCode.find((item) => item.label == selectedCountry);
    if (!selected || !selected.code) return 10;
    const len = PhoneLengthByCountry[selected.code];
    return len;
  };

  const phoneNumberValid = (value: string) => {
    const selected = CountryCode.find((item) => item.label == selectedCountry);
    if (!selected || !selected.code) return "Invalid country code";
    const len = PhoneLengthByCountry[selected.code];
    if (!len) return "select the country";
    return (
      value.replace(/\D/g, "").length === len ||
      `Phone number must be ${len} digits for ${selected.code}`
    );
  };
  return (
    <div className="w-full mb-5">
      {label != "" && (
        <label
          htmlFor={name}
          className={(dark ? "text-white" : "text-[#333]") + " inline-block mb-[8px] text-[16px] font-semibold"}
        >
          {label}
          {required && <span className="text-[#eb1700]">*</span>}
        </label>
      )}
      <div className="flex gap-4">
        {phName != "" && (
          <>
            <Controller
              name={phName}
              control={control}
              rules={{ required: "Country is required" }}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value || ""} // fallback to empty string
                  onChange={(e) => field.onChange(e.target.value)}
                  list="country-list"
                  placeholder="Country"
                  className="placeholder-[#757575] shadow-sm pl-[10px] py-3 border border-[#757575] rounded-[10px] w-[100px]"
                />
              )}
            />
            <datalist
              id="country-list"
              defaultValue={"🇮🇳 +91"}
              className="appearance-none"
            >
              {filteredCountries.map((c) => (
                <option key={c.code} value={c.label}></option>
              ))}
            </datalist>
          </>
        )}

        <Controller
          name={name}
          control={control}
          defaultValue=""
          rules={{
            required: requiredMsg,
            validate: (value) => {
              if (phName != "") {
                return phoneNumberValid(value);
              }
              if(name == "confirmPassword"){
                return value === getValues("newPassword") || "Passwords do not match";
              }
              if(required){
                return value.trim() !== "" || label + " cannot be just spaces.";
              }
              // return true;
            },
            pattern: pattern,
          }}
          render={({ field }) =>
            textarea ? (
              <textarea
                id={name}
                {...field}
                {...textareaProps}
                rows={6}
                placeholder={placeholder}
                className="w-full placeholder-[#757575] shadow-sm px-[20px] py-3 border border-[#757575] rounded-[10px]"
              />
            ) : !checkBox ? (
              <div className="relative w-full">
                {iconName != "" && (
                  <div className="absolute left-3 top-4 z-10">
                    <Icon
                      lib={iconLib}
                      color={dark ? "#fff" : "#000"}
                      name={iconName}
                      size={iconSize}
                    />
                  </div>
                )}
                <input
                  id={name}
                  {...field}
                  {...inputProps}
                  maxLength={phName != "" ? phLength() && phLength() : Infinity}
                  type={
                    type == "password" ? (show ? "text" : "password") : "text"
                  }
                  placeholder={placeholder}
                  className={
                    (iconName != "" ? "pl-[45px] " : "") + (dark ? "text-white" : "text-slate-900") +
                    " w-full shadow-sm px-[20px] pr-[45px] h-[50px] border border-slate-300 bg-transparent  placeholder:text-slate-500 rounded-lg focus:border-primary focus-visible:outline-black focus:ring-2 focus:ring-primary/20"
                  }
                />
                {type == "password" && (
                  <div
                    className="absolute right-3 top-4 z-10"
                    onClick={() => setShow(!show)}
                  >
                    <Icon
                      lib="io5"
                      color={dark ? "#fff" : "#000"}
                      name={show ? "IoEyeOutline" : "IoEyeOffOutline"}
                      size={20}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <Checkbox
                  {...field}
                  {...checkLabel}
                  sx={{
                    "&.MuiCheckbox-root": {
                      padding: 0,
                    },
                    "&.Mui-checked": {
                      "& .MuiSvgIcon-root": {
                        fill: "#fff", // For the checkmark icon
                      },
                    },
                  }}
                  className="accent-[#d6bc77] fil"
                  {...register("termsAccepted", {
                    required: "Vennligst godkjenn vilkårene",
                  })}
                />
                <span className="text-[#222] font-normal text-[14px] ml-3">
                  Jeg har lest og godkjent vilkårene
                </span>
              </>
            )
          }
        />
      </div>

      {errors[phName] && (
        <p className="mt-[8px] flex items-center text-[14px] font-medium leading-[20px] text-[#b71000]">
          <ErrorIcon
            fontSize="small"
            className="mr-[8px] text-[16px] text-[#b71000]"
          />
          {errors[phName]?.message?.toString()}
        </p>
      )}
      {errors[name] && (
        <p className="mt-[8px] flex items-center text-[14px] font-medium leading-[20px] text-[#b71000]">
          <ErrorIcon
            fontSize="small"
            className="mr-[8px] text-[16px] text-[#b71000]"
          />
          {errors?.[name]?.message?.toString()}
        </p>
      )}
    </div>
  );
};

export default InputCard;
