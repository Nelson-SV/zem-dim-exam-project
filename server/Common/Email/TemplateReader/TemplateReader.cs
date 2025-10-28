using Microsoft.Extensions.Hosting;

namespace Common.Email.TemplateReader;

public class TemplateReader
{
    private readonly string _templatesDirectory;

    public TemplateReader(IHostEnvironment env)
    {
        /*
        var currentDirectory = Directory.GetCurrentDirectory();
        var serverDirectory = Path.GetFullPath(Path.Combine(currentDirectory, "..")); 

        _templatesDirectory = Path.Combine(serverDirectory, "Common/Email", "Templates");
            
        if (!Directory.Exists(_templatesDirectory))
        {
            throw new DirectoryNotFoundException($"EmailTemplates directory not found at: {_templatesDirectory}");
        }
        */
        
        // The root of your app (works in dev & prod)
        var root = env.ContentRootPath;
        var serverRoot = Path.GetFullPath(Path.Combine(root, ".."));

        // Resolve path relative to your Common/Email/Templates directory
        _templatesDirectory = Path.Combine(serverRoot, "Common", "Email", "Templates");

        if (!Directory.Exists(_templatesDirectory))
        {
            throw new DirectoryNotFoundException($"Email templates directory not found at: {_templatesDirectory}");
        }
    }

    public string LoadTemplate(string templateName)
    {
        var templatePath = Path.Combine(_templatesDirectory, templateName);
        Console.WriteLine($"Loading email template: {templatePath}");
        
        if (!File.Exists(templatePath))
        {
            throw new FileNotFoundException($"Template '{templateName}' not found at: {templatePath}");
        }

        return File.ReadAllText(templatePath);
    }
    
    /*
    public string LoadTemplate(string templateName)
    {
        var templatePath = Path.Combine(_templatesDirectory, templateName);
        
        Console.WriteLine("Email template directory 1: " + templatePath);

        if (!File.Exists(templatePath))
        {
            throw new FileNotFoundException($"Template '{templateName}' not found at: {templatePath}");
        }

        return File.ReadAllText(templatePath);
    }
    
    // Loads email template for both environments (MailCatcher or SendGrid)
    public string LoadEmailTemplate(string templateName)
    {
        var rootDirectory = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"..\..\..\.."));
        var templateDirectory = Path.Combine(rootDirectory, "Common/Email", "Templates");
        var path = Path.Combine(templateDirectory, templateName);
        
        Console.WriteLine("Email template directory 2: " + path);
        
        if (!File.Exists(path))
        {
            throw new FileNotFoundException($"Email template '{templateName}' not found at: {path}");
        }

        return File.ReadAllText(path);
    }
    */
}