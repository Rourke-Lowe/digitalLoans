Digital Onboarding Requirements 

Member Onboarding – Applicant Form 

Provide your contact information > Create a Personal Account 

By default, the following fields will be listed in the following order. 

Field Name 

Input 

Origin 

First Name 

String (max 30 char) 

 

Second Name 

String (max 30 char) 

 

Last Name 

String (max 30 char) 

 

Email 

String (max 50 char) 

 

Phone 

Integer (4 input boxes for country code, area code, phone number and extension) 

 

Type 

Drop down (default value: Cell) 

Cell, Home, Daytime, FAX, Business (hard coded options) 

The Second Name field will only appear if it is configured as active in Settings > Application Flow > Form Field Configuration.  

If the Second Name section is changed in Settings > Application Flow > Form Field Configuration, then Second Name will appear on a different page.  

Only the Second Name field can be removed from this page. The First Name, Last Name, Email and Phone Number fields (excluding extension) will be active/mandatory for all applications. 

The name of this page cannot be changed in Settings > Application Flow > Form Field Configuration.  

This page will appear for all users – regardless of whether the Second Name field is active or not.  

Back button will return the user to the previous page. 

Continue button will be inactive (grayed out) until user has entered a value in all fields (excluding extension field). 

Provide your contact information > Verify your email 

User to receive 6-digit OTP to the email address provided on previous page.  

User can select Resend Code button to send a new 6-digit OTP via email.  

Upon click, the Resend Code button will disappear and be replaced with message “Sent! Please wait a few more seconds to try again.” After 30 seconds, the Resend Code button will return in place of this message.  

User can click on Back button to return to previous page in event they entered the wrong email.  

User must enter the received code. After 6-digits are provided, Continue button will become active. 

If user attempts to continue with an invalid code, user to be notified with error message “Invalid code. Please try again.” Message should appear in red and number boxes should also appear in red.  

The Invalid code error message and red number boxes will return to normal when the user begins to enter a new code. 

Smart has similar pages in UniFi mobile app. Please review the code to ensure the user experience is comparable. 

After the applicant verifies their email, an application will officially be opened for them with Incomplete status. The applicant can leave the session and return by providing email and OTP. Only one application per email is allowed.  

A validation check will be performed to confirm email address is not attached to another application. If it is, user will be returned to saved state. 

Tell us about yourself > Personal Information 

By default, the following fields will be listed in the following order. 

Field Name 

Input 

Origin 

Title 

String (max 15 char) 

 

Mother’s Maiden Name 

String (max 30 char) 

 

Gender 

Drop down 

Populate with options configured in Settings > Application Flow > Gender 

Birth Date 

Date 

 

Marital Status 

Drop down 

GetMaritalStatusesList – Description field 

Number of Dependents 

Integer 

 

Country of Citizenship 

Drop down 

List of countries produced and maintained by Softude 

Country of Birth 

Drop down 

List of countries produced and maintained by Softude 

Foreign Resident for Tax Purposes 

Drop down  

Yes, No (hard coded options) 

Jurisdiction for Tax Purposes 

Drop down 

List of countries produced and maintained by Softude 

The above fields will only appear if they are configured as active in Settings > Application Flow > Form Field Configuration. 

If none of the above fields are configured as active, the Tell us about yourself > Personal Information page will not appear to the user. 

If user has changed the name of the section from Personal Information, the updated page name will be reflected.  

If the user moves a field to another section, the respective field will no longer appear on this page.  

Back button will return the user to the previous page. 

Continue button will be inactive until user has entered a value in all fields.  

Upon continuing, user state is saved.  

Tell us about yourself > Home Address 

By default, the following fields will be listed in the following order.  

Field Name 

Input 

Origin 

Street # 

String (max 35 char)  

 

Street 2 

String (max 35 char) 

 

Street 3 

String (max 35 char) 

 

City 

String (max 30 char) 

 

Country 

Drop down  

List of countries produced and maintained by Softude 

Province 

Drop down 

List of provinces produced and maintained by Softude. Country field must be entered first, and this field will orient to the selected Country. 

Postal Code 

String (max 10 char) 

 

Residence Type 

Drop down 

Owned, Rents, Live with parents, Other (hard coded options) 

At Current Address Since 

Date 

 

The above fields will only appear if they are configured as active in Settings > Application Flow > Form Field Configuration. 

If none of the above fields are configured as active, the Tell us about yourself > Home Address page will not appear to the user. 

If user has changed the name of the section from Home Address, the updated page name will be reflected. 

If the user moves a field to another section, the respective field will not appear on this page. 

Back button will return the user to the previous page. 

Continue button will be inactive until user has entered a value in all fields. 

Upon continuing, user state is saved. 

Tell us about yourself > Consents 

By default, consents are active in Settings > Application Flow > Form Field Configuration.  

If user has changed the name of the section from Consents, the updated page name will be reflected.  

If the user moves consents to another section, then this page will not appear. 

The GetPersonConsentList will retrieve the consent options from Banking System. If the get request returns an empty list, consents should be hidden. 

Consent options should be listed one after another in the same order retrieved.  

Each consent should have a toggle which should be activated for all consents by default. The user can disable to indicate they withdraw their consent.  

The following disclaimer will appear: “Consents will be respected after the onboarding process is complete.” 

Back button will return the user to the previous page. 

Continue button will be inactive until user has entered a value in all fields. 

Upon continuing, user state is saved. 

Tell us about yourself > Account Usage 

The following fields will be listed in the following order.  

Field Name 

Input 

Origin 

Source of Funds 

Drop down 

Populate with options configured in Settings > Application Flow > Source of Funds 

Expected Deposit Frequency 

Dropdown 

Biweekly, Semi-Monthly, Quarterly, Semi-Annually, Yearly, Once, Monthly at Month End (hard coded options) 

Expected Deposit Amount 

Currency 

 

Currency of Expected Deposit 

Drop down 

Populate with options configured in Settings > Application Flow > Acceptable Currencies 

The above fields will only appear if they are configured as active in Settings > Application Flow > Form Field Configuration. 

If none of the above fields are configured as active, the Tell us about yourself > Account Usage page will not appear to the user. 

If user has changed the name of the section from Account Usage, the updated page name will be reflected.  

If the user moves a field to another section, the respective field will not appear on this page. 

Back button will return the user to the previous page. 

Continue button will be inactive until user has entered a value in all fields. 

Upon continuing, user state is saved. 

Tell us about yourself > Employment Information 

The following fields will be listed in the following order.  

Field Name 

Input 

Origin 

Employment Status 

Drop down 

GetEmploymentStatusList – Description field 

Employer Name 

String (max 50 char) 

 

Occupation 

String (max 30 char) 

 

Employment Effective Date 

Date 

 

Employment Payment Amount 

Currency 

 

Payment Period 

Drop down 

Monthly, Daily, Weekly, Biweekly, Semi-Monthly, Quarterly, Semi-Annually, Yearly, Once, Monthly at Month End (hard coded options) 

The above fields will only appear if they are configured as active in Settings > Application Flow > Form Field Configuration. 

If none of the above fields are configured as active, the Tell us about yourself > Employment Information page will not appear to the user. 

If user has changed the name of the section from Employment Information, the updated page name will be reflected on this page.  

If the user moves a field to another section, then that field will not appear on this page. 

Back button will return the user to the previous page. 

Continue button will be inactive until user has entered a value in all fields. 

Upon continuing, user state is saved. 

Upload Government-Issued ID and take a selfie 

User will be redirected to Signzy to perform ID validation.  

This must be configured to work for desktop and mobile.  

Signzy will provide getJourney results. Softude will capture the following from the output: 

Document images 

ID validation success or failure 

Document Name (Universa: PersonalDocumentTypeId) 

Document Number (Universa: DocumentNumber) 

Issuing State Name (Universa: TerritorialUnitOfIssue) 

Nationality Code (Universa: CountryOfIssueID) 

Date of Issue (Universa: IssueDate) 

Date of Expiry (Universa: ExpiryDate) 

Upon continuing, user state is saved. 

Upload Additional Documents 

All documents configured as required in Settings > Application Flow > Documents & IDs will be listed.  

If the required document was already captured by Signzy, exclude the document from the list.  

If the list is empty and there are no documents to display, skip this page.  

For each document, an upload button will be shown.  

The following fields will appear for each document if they are configured as required in Settings > Application Flow > Documents & IDs > Document Field Configuration. (On a document by document level) 

Field Name 

Input 

Origin 

Document Number 

String (max 30 char) 

 

Issue Date 

Date 

 

Country of Issue 

Drop down 

List of countries produced and maintained by Softude 

Province of Issue 

Drop down 

List of provinces produced and maintained by Softude 

Expiry Date 

Date 

 

Back button will return the user to the previous page. 

Continue button will be inactive until the user has uploaded all required documents. 

Upon continuing, user state is saved. 

On the backend, there should be a counter to add the number of documents uploaded through Signzy and on this page. 

Upload Additional Documents 

If the counter field is less than or equal to the Number of Required Documents configured in Settings > Application Flow > Documents & IDS, then skip this page. 

All documents configured as non-required in Settings > Application Flow > Documents & IDS will be listed below the following text: “Please upload <number> of the following.” Number should be replaced with Settings > Application Flow > Documents > Number of Required Documents less counter. For example, user provided one document through Signzy and one document on previous page (counter=2). If Number of Required Documents is 3 (3-2=1), text should read: “Please upload 1 of the following.” 

If the non-required document was already captured by Signzy, exclude the document from this list.  

If the list is empty and there are no remaining documents to display, skip this page. 

For each document, an upload button will be shown.  

The following fields will appear for each document if they are configured as required in Settings > Application Flow > Documents & IDS > Document Field Configuration. (On a document by document level) 

Field Name 

Input 

Origin 

Document Number 

String (max 30 char) 

 

Issue Date 

Date 

 

Country of Issue 

Drop down 

List of countries produced and maintained by Softude 

Province of Issue 

Drop down 

List of provinces produced and maintained by Softude 

Expiry Date 

Date 

 

Back button will return the user to the previous page. 

Continue button will be inactive until counter is greater than or equal to Settings > Application Flow > Documents > Required Number of Documents. 

Upon continuing, user state is saved. 

Choose an Account > Open an Account 

Configured Product Name and Description will appear for each subaccount – according to Settings > Product > Description. 

This page will display the subaccounts that will automatically be created first, which will include products configured in Settings > Products with the Default Subaccount or Share Required toggle activated. User will not be able to disable these subaccounts. 

The user can add additional subaccounts if the financial institution has configured additional products in Settings > Products.  

For each subaccount, the user will be required to enter Intended Use if the field is configured as active in Settings > Products. 

Field Name 

Input 

Origin 

Intended Use 

Drop down – If web service returns empty list, update input to String (max 50 char) 

GetPersonalSubAccountIntendedUseList – SubaccountIntendedUse field 

Back button will return the user to the previous page. 

Continue button will active when page is loaded. 

Upon continuing, user state is saved. 

Success 

A success message is displayed to the applicant to notify them their application has been submitted.  

Application ID is displayed to the applicant for reference purposes.  

Application status will be updated from Incomplete to Pending Review. 

The financial institution will receive an email to address configured in Settings > General > Contact Email. Email will include application ID, applicant’s name, and application status.  

Applicant will receive an email to address provided on Provide your contact information > Create a Personal Account page. Application Received template – in Settings > Application Flow > Email Templates – will be used to compose message to applicant. 

 

 

Configuration Panel 

Dashboard 

All applications will be accessible from the dashboard.  

By default, the list will be sorted by date/time. However, user can sort by any field.  

By default, the list will be filtered to exclude Incomplete, Approved and Denied applications. However, user can adjust filters to filter by application ID, status or date range. *Applied filters will be shown to user to ensure they understand which data is visible and hidden. 

User can search by name and application ID. 

Results should be paginated with 10 results on each page, and user can select Next and Previous options or navigate by page number.  

The following fields will be displayed: 

SUBMITTED 

Application ID 

NAME 

TAG 

STATUS 

Datetime 

Integer 

LastName, FirstName 

List of subaccounts included in application 

Incomplete, Pending Review, Awaiting Applicant, Approved, Denied or Rejected 

User can click on an application to view the details.  

Dashboard > an application > Details 

Applicant details 

Application ID, application status, date submitted, and applicant’s name will appear.  

KYC  

Field will indicate whether the user passed or failed Signzy verifications. 

Notes	 

Will appear below the applicant’s name. 

Will appear in format <datetime> - <note description>. 

Sorted by date, with most recent at the top. 

ADD A NOTE 

Popup with input box and submit button to appear.  

User must provide note description.  

Upon submit, note will be added to Notes section with datetime submitted.  

There will be no ability to delete or edit notes. 

REQUEST FUNDS 

The REQUEST FUNDS button will only be accessible to users with Request privileges. 

Button will be inactive in Approved and Denied applications.  

Upon click, an email will be sent to the email address located in the REGISTRATION INFO section. The email message will use Request Funds template in Settings > Application Flow > Email Templates.  

Upon click, the application status will be updated to Awaiting Applicant. 

REQUEST MORE INFO 

The REQUEST MORE INFO button will only be accessible to users with Request privileges. 

Button will be inactive in Approved and Denied applications.  

Upon click, popup will appear to user allowing them to enter a custom message to applicant. 

Email will be sent from no-reply email.  

In response to email, the applicant will be responsible to log in to digital onboarding with email and OTP to provide the missing information. If the applicant provides additional info and re-submits the form, their application status will be returned to Pending Review. 

Upon click, a note will be applied to the application with the custom message and a datetime stamp.  

Upon click, application status will be updated to Awaiting Applicant.  

DENY 

The DENY button will only be accessible to users with Approve privileges.  

Button will be inactive in Approved or Denied applications.  

When the user clicks to deny an application, they will receive a warning message asking them if they are sure they want to deny the application.  

When users are denied, an email will be sent to the email address located in the REGISTRATION INFO section using Application Denied template in Settings > Application Flow > Email Templates. 

When users are denied, the application status will be updated to Denied.  

APPROVE 

The APPROVE button will only be accessible to users with Approve privileges. 

Button will be inactive in Approved and Denied applications. 

When a user attempts to approve an application, they will receive a warning message asking them if they are sure they are ready to approve the application.  

During application approval process, Softude will attempt to send application details to Universa.  

If Universa accepts without error, application status will be updated to Approved and an email will be sent to the email address located in the REGISTRATION INFO section using the Application Denied template in Settings > Application Flow > Email Templates.  

If Universa returns error, error(s) will be attached to the application in the form of a note with a datetime stamp and application status will be updated to Rejected. 

REGISTRATION INFO 

Under the REGISTRATION INFO category, the First Name, Second Name, Last Name, Email and Phone Number will appear.  

Custom categories 

The remaining fields in Settings > Application Flow > Form Field Configuration will be grouped by the Section field. By default, PERSONAL INFORMATION, HOME ADDRESS, ACCOUNT USAGE and EMPLOYMENT INFORMATION would appear after the REGISTRATION INFO section.  

PRODUCTS 

List products that will be opened on behalf of the applicant. 

Show the Intended Use field if it is active in Settings > Application Flow > Form Field Configuration. 

OTHER 

When at least one field in Settings > Application Flow > Management Field Configuration is configured as active, OTHER category will appear.  

By default, this category will include the following fields. However, only active fields will appear on the list. 

Field Name 

Input 

Origin 

CRS Status 

Drop down 

Reportable, Non-reportable (hard coded options) 

PEP/HIO Determination 

Drop down 

Yes, No (hard coded options) 

PEP/HIO Position 

Drop down 

GetPEPHIOPositionList – Description field 

PEP/HIO Relationship 

String (max 30 char) 

 

Risk Rate 

Drop down 

Populate with options configured in Settings > Application Flow > Risk Rates 

This category will have an edit button that will only be accessible to users with Edit privileges.  

ID & DOCUMENTS 

Next, an ID & DOCUMENTS section will display all document details gathered by the user, including images. 

Any time an application status change occurs, the financial institution will receive an email to address configured in Settings > General > Contact Email. Message will list the application ID, applicant’s name, and application status. 

Settings > General 

The following editable fields will appear: 

Field Name 

Data Type 

Purpose 

Institution Name 

String (max 50 char) 

This field can be included in email notifications. 

Contact Email 

String (max 50 char) 

An email will be sent to this contact to notify of new applications and status changes. 

Primary Color 

String (max 8 char) 

This will be used as the dominant color throughout the app. 

Logo Upload 

Image 

The logo will appear in management console upper-left and will be persistent on all screens. 

 

Settings > Application Flow > Form Field Configuration 

By default, the following information should be applied to all clients: 

Field Name 

Banking System Field 

Section 

Active 

First Name 

First Name 

Create a Personal Account 

ON 

Second Name 

Second Name 

Create a Personal Account 

ON 

Last Name 

Last Name 

Create a Personal Account 

ON 

Email 

Email 

Create a Personal Account 

ON 

Phone Number 

Phone Number 

Create a Personal Account 

ON 

Title 

Title 

Personal Information 

ON 

Mother’s Maiden Name 

Mother’s Maiden Name 

Personal Information 

ON 

Gender 

Gender 

Personal Information 

ON 

Birth Date 

Birth Date 

Personal Information 

ON 

Marital Status 

Marital Status 

Personal Information 

ON 

Number of Dependents 

Number of Dependents 

Personal Information 

ON 

Country of Citizenship 

Country of Citizenship 

Personal Information 

ON 

Country of Birth 

Country of Birth 

Personal Information 

ON 

Foreign Resident for Tax Purposes 

Foreign Resident for Tax Purposes 

Personal Information 

ON 

Jurisdiction for Tax Purposes 

Jurisdiction for Tax Purposes 

Personal Information 

ON 

Street # 

Street # 

Home Address 

ON 

Street 2 

Street 2 

Home Address 

ON 

Street 3 

Street 3 

Home Address 

ON 

City 

City 

Home Address 

ON 

Country 

Country 

Home Address 

ON 

Province 

Province 

Home Address 

ON 

Postal Code 

Postal Code 

Home Address 

ON 

Residence Type 

Residence Type 

Home Address 

ON 

At Current Address Since 

At Current Address Since 

Home Address 

ON 

Source of Funds 

Source of Funds 

Account Usage 

ON 

Expected Deposit Frequency 

Expected Deposit Frequency 

Account Usage 

ON 

Expected Deposit Amount 

Expected Deposit Amount 

Account Usage 

ON 

Currency of Expected Deposit 

Currency of Expected Deposit 

Account Usage 

ON 

Employment Status 

Employment Status 

Employment Information 

ON 

Employer Name 

Employer Name 

Employment Information 

ON 

Occupation 

Occupation 

Employment Information 

ON 

Employment Effective Date 

Employment Effective Date 

Employment Information 

ON 

Employment Payment Amount 

Employment Payment Amount 

Employment Information 

ON 

Payment Period 

Payment Period 

Employment Information 

ON 

Intended Use 

Intended Use 

Open an Account 

ON 

User can update the Field Name which will be reflected in the application form. This applies to any of the fields listed above.  

The Banking System Field column cannot be edited for any field.  

User can update the Section column to change the wording which will move a field to a different page. However, the First Name, Last Name, Email, Phone Number, Intended Use sections cannot be updated. In the application form, the sections should appear in the order seen above. For example, Create a Personal Account, Personal Information, Home Address etc.  

When a field is activated, the field will be added to all application forms – including old or incomplete applications in saved state. This is important because if an application is rejected by Universa due to a missing mandatory field, FI would need to activate the field, then send a request for more info email to the applicant. The applicant would need to log back into digital onboarding with their email and one-time passcode to add the requested info and re-apply. 

Settings > Application Flow > Gender 

Users must provide all data listed below to add a gender option.  

Gender 

Banking System Field 

String (max 35 char) 

String (max 35 char) 

This information will only be applicable if the Gender field in Settings > Application Flow > Form Field Configuration is active.  

By default, no genders will be configured.  

Settings > Application Flow > Source of Funds 

Users must provide all data listed below to add a source of funds option.  

Source of Funds 

Banking System Field 

String (max 35 char) 

String (max 35 char) 

This information will only be applicable if the Source of Funds field in Settings > Application Flow > Form Field Configuration is active.  

By default, no source of funds will be configured. 

Settings > Application Flow > Acceptable Currencies 

Users must provide all data listed below to add a currency option.  

Acceptable Currencies 

Banking System Field 

String (max 35 char) 

Integer 

This information will only be applicable if the Currency of Expected Deposit field in Settings > Application Flow > Form Field Configuration is active.  

By default, no acceptable currencies will be configured. 

Settings > Application Flow > Risk Rates 

Users must provide all data listed below to add a risk rate option.  

Risk Rate 

Banking System Field 

String (max 35 char) 

Integer 

This information will only be applicable if the Risk Rate field in Settings > Application Flow > Management Field Configuration is active. 

By default, no risk rates will be configured. 

Settings > Application Flow > Management Field Configuration 

By default, the following information should be applied to all clients: 

Field Name 

Banking System Field 

Section 

Active 

CRS Status 

CRS Status 

Dashboard > an application > Details > Other 

ON 

PEP/HIO Determination 

PEP/HIO Determination 

Dashboard > an application > Details > Other 

ON 

PEP/HIO Position 

PEP/HIO Position 

Dashboard > an application > Details > Other 

ON 

PEP/HIO Relationship 

PEP/HIO Relationship 

Dashboard > an application > Details > Other 

ON 

Risk Rate 

Risk Rate 

Dashboard > an application > Details > Other 

ON 

The above fields will not appear in the application form. These fields will be configured by the financial institution in the management portal.  

The field names can be updated and reflected in the associated section listed above. 

User cannot update the Section column of this table.  

User can activate or deactivate each field. Only active fields will appear in the associated sections.   

When a change is made to activate a field, the field will be added for all outstanding applications in Dashboard > an application > Details.  

When a change is made to deactivate a field, if an application has this information already provided by the applicant,the data will continue to appear in Dashboard > an application > Details. All new applications created after the field is deactivated will no longer show this field in Dashboard > an application > Details.  

Settings > Application Flow > Documents & IDs 

Number of Required Documents input box allows users to set the number of documents that must be uploaded. By default, 0 documents are required. When the user attempts to update this number, a validation check will verify the number of documents that have been configured in the document table below. If the user attempts to enter a value that is higher than the number of configured documents, the following error message will be displayed: “The number of required documents cannot exceed the number of configured documents below.” 

User must enter the following information to add a document or ID: 

Document Name 

Banking System Document ID 

Document Field Configuration 

Required 

Edit 

String (max 50 char) 

Integer (allow negative number) 

Document Number, Territorial Unit of Issue, Country of Issue, Issue Date, Expiry Date 

On/off toggle 

Edit Button 

User can add/edit/delete each document/ID.  

No documents/IDs will be configured by default. 

Each field in Document Field Configuration can be configured as required. Only required fields will be listed in this column. 

By default, all document fields will be mandatory and required toggle will be ON for all new documents/IDs. 

Note: We will need to map Signzy document names to the document names listed here. This may present challenges during the implementation process.  

Settings > Application Flow > Email Templates 

The following email templates should be listed – in the following order. Here are the default email scripts and intended recipients for each template: 

Name 

Recipient 

Default Script 

Application Received 

Will be sent to applicant’s email in Dashboard > an application > Details 

<First Name> <Last Name>, application #<Application ID > to open an account with <Institution Name> has been received. Please allow 3-5 days for processing. You will be notified when your application has been approved. 

Application Approved 

Will be sent to applicant’s email in Dashboard > an application > Details. 

<First Name> <Last Name>, application # <Application ID > to open an account with <Institution Name> has been approved. 

Application Denied 

Will be sent to applicant’s email in Dashboard > an application > Details. 

<First Name> <Last Name>, application #<Application ID> to open an account with <Institution Name> has been denied.  

Application Rejected 

This email should only be sent to the financial institution email address configured in Settings > General > Contact Email. 

Application #<Application ID> has been rejected by the banking system. 

Request Funds 

Will be sent to applicant’s email in Dashboard > an application > Details. 

 

Each template will have an Edit Template button. User can update the default scripts mentioned above.  

The emails will be sent from a no reply email.  

Settings > Products 

Users can add deposit subaccounts, but they will need to indicate whether the subaccount will be created automatically by the banking system.  

Product Name 

Banking System Product ID 

Description 

Default Subaccount or Share Required 

Edit 

String (max 35 char) 

Integer 

String (max 100 char) 

On/off toggle 

Edit button 

All of the above fields can be edited by the user.  

Configured products will appear in Choose an Account > Open an Account section.  

Settings > Users > Users 

Need to track all user changes in audit table. For example, when a user updates a field or approves an application. Old value and new value should be retained in this table. 

The user must configure the following fields to create a new user.  

Banking System User ID 

Name 

Email 

Role 

Status 

Edit 

Integer 

String (max 30 char) 

String (max 50 char) 

Drop down with Teller, Officer, Manager, Admin hard coded options 

On/off toggle 

Edit Button 

User can edit any of the above fields. 

User cannot deactivate their own user ID.  

Settings > Users > Permissions 

Access permissions include Request, Edit, Approve, Settings. 

Request permission allows the user to click on the Request More Info button in Dashboard > an application > Details.  

Edit permission allows the user to edit the application details in Dashboard > an application > Details. 

Approve permission allows the user to click on the Approve and Deny buttons in Dashboard > an application > Details. 

Settings permission allows the user to access the Settings and make administrative changes to the digital onboarding application. The Settings button (upper-right of screen) will not appear for any user who is not assigned to role with this permission.  

User can add or remove permissions for each role. 

 

 

 

CreatePersonalAccount Web Service for Approved Applications 

Web Service Field 

Digital Onboarding Field 

Title 

Tell us about yourself > Personal Information > Title 

FirstName 

Create a password and verify your email > Create a Personal Account > First Name 

SecondName 

Create a password and verify your email > Create a Personal Account > Second Name 

LastName 

Create a password and verify your email > Create a Personal Account > Last Name 

LegalFirstName 

Create a password and verify your email > Create a Personal Account > First Name 

LegalSecondName 

Create a password and verify your email > Create a Personal Account > Second Name 

LegalLastName 

Create a password and verify your email > Create a Personal Account > Last Name 

Gender 

Tell us about yourself > Personal Information > Gender 

DateOfBirth 

Tell us about yourself > Personal Information > Date of Birth 

MaritalStatusId 

GetMaritalStatusesList (Tell us about yourself > Personal Information > Marital Status) 

PersonalDocumentTypeId 

GetPersonalDocumentTypeList 

DocumentName 

Upload Government-Issued ID and take a selfie > Document Name  

Upload Additional Documents > Document Name 

IssueDate 

Upload Government-Issued ID and take a selfie > Issue Date 

Upload Additional Documents > Issue Date 

TerritorialUnitOfIssue 

Upload Government-Issued ID and take a selfie > Province of Issue 

Upload Additional Documents > Province of Issue 

CountryOfIssueID 

Upload Government-Issued ID and take a selfie > Country of Issue 

Upload Additional Documents > Country of Issue 

ExpiryDate 

Upload Government-Issued ID and take a selfie > Expiry Date 

Upload Additional Documents > Expiry Date 

VerificationDate 

Current date (date of application approval provide for all documents) 

CountryOfCitizenship 

Tell us about yourself > Personal Information > Country of Citizenship 

CountryOfBirth 

Tell us about yourself > Personal Information > Country of Birth 

ForeignResidentForTaxPurposes 

Tell us about yourself > Personal Information > Foreign Resident for Tax Purposes 

JurisdictionForTaxPurposes 

Tell us about yourself > Personal Information > Jurisdiction for Tax Purposes 

CRSStatus 

Dashboard > an application > Details 

Street 

Tell us about yourself > Home Address > Street # 

Street2 

Tell us about yourself > Home Address > Street2 

Street3 

Tell us about yourself > Home Address > Street3 

City 

Tell us about yourself > Home Address > City 

TerritorialUnit 

Tell us about yourself > Home Address > Province 

PostalCode 

Tell us about yourself > Home Address > Postal Code 

Country 

Tell us about yourself > Home Address > Country 

AtCurrentAddressSince 

Tell us about yourself > Home Address > At current address since 

ResidenceCode 

Tell us about yourself > Home Address > Residence Type 

AreaCode 

Create a password and verify your email > Create a Personal Account > Phone 

Number 

Create a password and verify your email > Create a Personal Account > Phone 

Extension 

Create a password and verify your email > Create a Personal Account > Phone > Ext 

Type 

Create a password and verify your email > Create a Personal Account > Type (1=Home, 2=Daytime, 3=Cell, 4=Fax, 5=Business) 

ClientSince 

Current date (date of application approval) 

Email 

Create a password and verify your email > Create a Personal Account > Email 

EmploymentStatusID 

Tell us about yourself > Employment Information > Employment Status 

EmployerName 

Tell us about yourself > Employment Information > Employer Name 

Occupation 

Tell us about yourself > Employment Information > Occupation 

EmployedSince 

Tell us about yourself > Employment Information >Employment Effective Date 

PaymentAmount 

Tell us about yourself > Employment Information > Employment Payment Amount 

PaymentPeriod 

Tell us about yourself > Employment Information > Payment Period 

RiskRate 

Dashboard > an application > Details 

PEPHIODetermination 

Dashboard > an application > Details 

PEPHIOPositionID 

Dashboard > an application > Details 

PEPHIORelationship 

Dashboard > an application > Details 

ConsentID 

GetPersonConsentList (Tell us about yourself > Consents map description to ID) 

Given 

Tell us about yourself > Consents 

True – for consent given 

False – for consent refused 

ExpectedDepositAmount 

Tell us about yourself > Account Usage > Expected Deposit Amount 

ExpectedDepositFrequency 

Tell us about yourself > Account Usage > Expected Deposit Frequency 

CurrencyCodeOfExpectedDeposit 

Tell us about yourself > Account Usage > Currency Code of Expected Deposit 

SourceofFunds 

Tell us about yourself > Account Usage > Source of Funds 

NumberofDependents 

Tell us about yourself > Personal Information > Number of Dependents 

SubaccountType 

Settings > Products > Banking System Product ID 

IntendedUse 

Choose an Account > Open an Account 

 