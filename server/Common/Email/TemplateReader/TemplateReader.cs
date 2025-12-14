using System.Net;
using Microsoft.Extensions.Hosting;

namespace Common.Email.TemplateReader;

public class TemplateReader
{
    private readonly string _templatesDirectory;

    public TemplateReader(IHostEnvironment env)
    {
        // The root of app 
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
    
    public string RenderValues(string template, IDictionary<string, string> tokens)
    {
        foreach (var (key, value) in tokens)
        {
            template = template.Replace("{{" + key + "}}", WebUtility.HtmlEncode(value));
        }

        return template;
    }
}